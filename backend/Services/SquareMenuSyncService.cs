using backend.Models;
using Square;
using Square.Catalog;
using Supabase;

namespace backend.Services
{
    public class SquareMenuSyncService : ISquareMenuSyncService
    {
        private readonly SquareClient _square;
        private readonly Client _supabase;

        public SquareMenuSyncService(SquareClient squareClient, Client supabaseClient)
        {
            _square = squareClient;
            _supabase = supabaseClient;
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

                var name = sqItem.ItemData?.Name ?? string.Empty;
                if (string.IsNullOrWhiteSpace(name))
                    continue;

                var description = sqItem.ItemData?.Description ?? sqItem.ItemData?.DescriptionHtml ?? string.Empty;

                // Choose first variation price if present
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

                string? categoryName = null;
                var categoryId = sqItem.ItemData?.CategoryId;
                if (!string.IsNullOrWhiteSpace(categoryId) && categories.TryGetValue(categoryId!, out var catName))
                {
                    categoryName = catName;
                }

                // Try to find existing by restaurant + name
                var existing = await _supabase.From<Item>()
                    .Where(i => i.Restaurant_Id == restaurantId && i.Name == name)
                    .Limit(1)
                    .Get();

                if (existing.Models.Count > 0)
                {
                    var model = existing.Models[0];
                    var changed = false;

                    if (Math.Abs(model.Price - price) > 0.0001f) { model.Price = price; changed = true; }
                    if (!string.Equals(model.Category, categoryName, StringComparison.Ordinal)) { model.Category = categoryName; changed = true; }
                    if (!string.Equals(model.Description, description, StringComparison.Ordinal)) { model.Description = description; changed = true; }

                    if (changed)
                    {
                        await _supabase.From<Item>()
                            .Where(i => i.Id == model.Id)
                            .Update(model);
                        upserted++;
                    }
                }
                else
                {
                    var model = new Item
                    {
                        Name = name,
                        Price = price,
                        Category = categoryName,
                        Description = description,
                        Restaurant_Id = restaurantId
                    };

                    await _supabase.From<Item>()
                        .Insert(model);
                    upserted++;
                }
            }

            return upserted;
        }
    }
}
