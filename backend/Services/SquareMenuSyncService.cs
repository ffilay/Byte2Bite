using backend.Models;
using Square;
using Square.Catalog;
using Supabase;
using Supabase.Postgrest.Exceptions;
using System.Linq;

namespace backend.Services
{
    public class SquareMenuSyncService : ISquareMenuSyncService
    {
        private readonly SquareClient _square;
        private readonly Supabase.Client _supabase;

        public SquareMenuSyncService(SquareClient squareClient, ISupabaseService supabaseService)
        {
            _square = squareClient;
            _supabase = supabaseService.Client;
        }

        public async Task<int> ImportMenuItemsAsync(int restaurantId, CancellationToken cancellationToken = default)
        {
            var categories = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            var items = new List<CatalogObject>();

            // List all catalog objects (Square pager supports await foreach)
            var pager = await _square.Catalog.ListAsync(new ListCatalogRequest());
            await foreach (var obj in pager)
            {
                if (obj.TryAsCategory(out var cat) && cat is not null)
                {
                    if (!string.IsNullOrWhiteSpace(cat.Id))
                    {
                        categories[cat.Id] = cat.CategoryData?.Name ?? string.Empty;
                    }
                }
                else if (obj.TryAsItem(out _))
                {
                    items.Add(obj);
                }
            }

            var upserted = 0;

            foreach (var obj in items)
            {
                if (!obj.TryAsItem(out var sqItem) || sqItem is null)
                    continue;

                var baseName = sqItem.ItemData?.Name ?? string.Empty;
                if (string.IsNullOrWhiteSpace(baseName))
                    continue;

                var description = sqItem.ItemData?.Description ?? sqItem.ItemData?.DescriptionHtml ?? string.Empty;

                string? categoryName = null;
                var categoryId = sqItem.ItemData?.CategoryId;
                if (string.IsNullOrWhiteSpace(categoryId) && sqItem.ItemData is not null)
                {
                    // Newer Square payloads provide item_data.categories[] and/or reporting_category
                    var itemData = sqItem.ItemData;

                    // Try item_data.categories[0].id via reflection to avoid SDK version mismatches
                    var catsProp = itemData.GetType().GetProperty("Categories");
                    var catsVal = catsProp?.GetValue(itemData) as System.Collections.IEnumerable;
                    if (catsVal is not null)
                    {
                        foreach (var c in catsVal)
                        {
                            var idProp = c?.GetType().GetProperty("Id");
                            var idVal = idProp?.GetValue(c) as string;
                            if (!string.IsNullOrWhiteSpace(idVal)) { categoryId = idVal; break; }
                        }
                    }

                    // Fallback: reporting_category.id
                    if (string.IsNullOrWhiteSpace(categoryId))
                    {
                        var repProp = itemData.GetType().GetProperty("ReportingCategory");
                        var repVal = repProp?.GetValue(itemData);
                        var repIdProp = repVal?.GetType().GetProperty("Id");
                        var repIdVal = repIdProp?.GetValue(repVal) as string;
                        if (!string.IsNullOrWhiteSpace(repIdVal))
                            categoryId = repIdVal;
                    }
                }

                if (!string.IsNullOrWhiteSpace(categoryId) && categories.TryGetValue(categoryId!, out var catName))
                {
                    categoryName = catName;
                }

                var variations = sqItem.ItemData?.Variations;

                if (variations is not null && variations.Any())
                {
                    foreach (var varObj in variations)
                    {
                        if (!varObj.TryAsItemVariation(out var sqVar) || sqVar is null)
                            continue;

                        // Price from this specific variation
                        float price = 0f;
                        object? money = sqVar.ItemVariationData?.PriceMoney;
                        if (money is not null)
                        {
                            var amountProp = money.GetType().GetProperty("Amount");
                            if (amountProp?.GetValue(money) is long cents)
                            {
                                price = (float)(cents / 100.0);
                            }
                        }

                        var variationName = sqVar.ItemVariationData?.Name ?? string.Empty;
                        var combinedName = string.IsNullOrWhiteSpace(variationName) ? baseName : $"{baseName} - {variationName}";
                        var squareItemId = sqItem.Id;
                        var squareVariationId = sqVar.Id;

                        // Prefer matching by Square variation ID (stable), fallback to name for legacy rows
                        Item? model = null;
                        if (!string.IsNullOrWhiteSpace(squareVariationId))
                        {
                            try
                            {
                                var byVar = await _supabase.From<Item>()
                                    .Where(i => i.Restaurant_Id == restaurantId && i.Square_Variation_Id == squareVariationId)
                                    .Limit(1)
                                    .Get();
                                model = byVar.Models.FirstOrDefault();
                            }
                            catch (PostgrestException ex) when (ex.Message.Contains("22P02"))
                            {
                                // Type mismatch on DB column – skip ID match and fall back to name
                                model = null;
                            }
                        }

                        if (model is null)
                        {
                            var byName = await _supabase.From<Item>()
                                .Where(i => i.Restaurant_Id == restaurantId && i.Name == combinedName)
                                .Limit(1)
                                .Get();
                            model = byName.Models.FirstOrDefault();
                        }

                        if (model is not null)
                        {
                            var changed = false;

                            if (!string.Equals(model.Name, combinedName, StringComparison.Ordinal)) { model.Name = combinedName; changed = true; }
                            if (Math.Abs(model.Price - price) > 0.0001f) { model.Price = price; changed = true; }
                            if (!string.Equals(model.Category, categoryName, StringComparison.Ordinal)) { model.Category = categoryName; changed = true; }
                            if (!string.Equals(model.Description, description, StringComparison.Ordinal)) { model.Description = description; changed = true; }
                            if (!string.Equals(model.Square_Item_Id, squareItemId, StringComparison.Ordinal)) { model.Square_Item_Id = squareItemId; changed = true; }
                            if (!string.Equals(model.Square_Variation_Id, squareVariationId, StringComparison.Ordinal)) { model.Square_Variation_Id = squareVariationId; changed = true; }
                            if (!string.Equals(model.Variation_Name, variationName, StringComparison.Ordinal)) { model.Variation_Name = variationName; changed = true; }

                            if (changed)
                            {
                                try
                                {
                                    await _supabase.From<Item>()
                                        .Where(i => i.Id == model.Id)
                                        .Update(model);
                                    upserted++;
                                }
                                catch (PostgrestException ex) when (ex.Message.Contains("22P02"))
                                {
                                    // DB type mismatch for Square IDs – retry without those fields
                                    model.Square_Item_Id = null;
                                    model.Square_Variation_Id = null;
                                    await _supabase.From<Item>()
                                        .Where(i => i.Id == model.Id)
                                        .Update(model);
                                    upserted++;
                                }
                            }
                        }
                        else
                        {
                            var modelNew = new Item
                            {
                                Name = combinedName,
                                Price = price,
                                Category = categoryName,
                                Description = description,
                                Restaurant_Id = restaurantId,
                                Square_Item_Id = squareItemId,
                                Square_Variation_Id = squareVariationId,
                                Variation_Name = string.IsNullOrWhiteSpace(variationName) ? null : variationName
                            };

                            try
                            {
                                await _supabase.From<Item>()
                                    .Insert(modelNew);
                                upserted++;
                            }
                            catch (PostgrestException ex) when (ex.Message.Contains("22P02"))
                            {
                                modelNew.Square_Item_Id = null;
                                modelNew.Square_Variation_Id = null;
                                await _supabase.From<Item>()
                                    .Insert(modelNew);
                                upserted++;
                            }
                        }
                    }
                }
                else
                {
                    // No variations present, fall back to item-level record
                    float price = 0f;
                    var firstVarObj = sqItem.ItemData?.Variations?.FirstOrDefault();
                    object? money = null;
                    if (firstVarObj != null && firstVarObj.TryAsItemVariation(out var sqVar) && sqVar is not null)
                    {
                        money = sqVar.ItemVariationData?.PriceMoney;
                    }
                    if (money is not null)
                    {
                        var amountProp = money.GetType().GetProperty("Amount");
                        if (amountProp?.GetValue(money) is long cents)
                        {
                            price = (float)(cents / 100.0);
                        }
                    }

                    var squareItemId = sqItem.Id;

                    var existing = await _supabase.From<Item>()
                        .Where(i => i.Restaurant_Id == restaurantId && i.Name == baseName)
                        .Limit(1)
                        .Get();

                    if (existing.Models.Count > 0)
                    {
                        var model = existing.Models[0];
                        var changed = false;

                        if (Math.Abs(model.Price - price) > 0.0001f) { model.Price = price; changed = true; }
                        if (!string.Equals(model.Category, categoryName, StringComparison.Ordinal)) { model.Category = categoryName; changed = true; }
                        if (!string.Equals(model.Description, description, StringComparison.Ordinal)) { model.Description = description; changed = true; }
                        if (!string.Equals(model.Square_Item_Id, squareItemId, StringComparison.Ordinal)) { model.Square_Item_Id = squareItemId; changed = true; }

                        if (changed)
                        {
                            try
                            {
                                await _supabase.From<Item>()
                                    .Where(i => i.Id == model.Id)
                                    .Update(model);
                                upserted++;
                            }
                            catch (PostgrestException ex) when (ex.Message.Contains("22P02"))
                            {
                                model.Square_Item_Id = null;
                                model.Square_Variation_Id = null;
                                await _supabase.From<Item>()
                                    .Where(i => i.Id == model.Id)
                                    .Update(model);
                                upserted++;
                            }
                        }
                    }
                    else
                    {
                        var model = new Item
                        {
                            Name = baseName,
                            Price = price,
                            Category = categoryName,
                            Description = description,
                            Restaurant_Id = restaurantId,
                            Square_Item_Id = squareItemId
                        };

                        try
                        {
                            await _supabase.From<Item>()
                                .Insert(model);
                            upserted++;
                        }
                        catch (PostgrestException ex) when (ex.Message.Contains("22P02"))
                        {
                            model.Square_Item_Id = null;
                            model.Square_Variation_Id = null;
                            await _supabase.From<Item>()
                                .Insert(model);
                            upserted++;
                        }
                    }
                }
            }

            return upserted;
        }
    }
}
