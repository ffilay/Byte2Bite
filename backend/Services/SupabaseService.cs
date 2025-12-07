using backend.Models;
using Supabase;
using System.Linq;
using Supabase.Postgrest.Exceptions;

namespace backend.Services
{
    public class SupabaseService : ISupabaseService
    {
        private readonly Supabase.Client _client;

        public SupabaseService(IConfiguration config)
        {
            var url = config["Supabase:Url"];
            var serviceKey = config["Supabase:ServiceKey"]; // or ServiceKey if you stored it that way

            if (string.IsNullOrEmpty(url) || string.IsNullOrEmpty(serviceKey))
                throw new InvalidOperationException("Supabase configuration values are missing.");

            var options = new SupabaseOptions
            {
                AutoRefreshToken = true,
                AutoConnectRealtime = false
            };

            _client = new Supabase.Client(url, serviceKey, options);
            _client.InitializeAsync().Wait();
        }

        public Supabase.Client Client => _client;

        public async Task<IEnumerable<Ingredient>> GetIngredientsAsync(int limit = 100)
        {
            var response = await _client.From<Ingredient>()
                                        .Select("*")
                                        .Limit(limit)
                                        .Get();
            return response.Models;
        }

        public async Task<Ingredient?> GetIngredientByIdAsync(int id)
        {
            var response = await _client.From<Ingredient>()
                                        .Where(i => i.Id == id)
                                        .Limit(1)
                                        .Get();
            return response.Models.FirstOrDefault();
        }

        public async Task<Ingredient?> CreateIngredientAsync(Ingredient ingredient)
        {
            var response = await _client.From<Ingredient>()
                                        .Insert(ingredient);
            return response.Models.FirstOrDefault();
        }

        public async Task<Ingredient?> UpdateIngredientAsync(int id, Ingredient ingredient)
        {
            var response = await _client.From<Ingredient>()
                                        .Where(i => i.Id == id)
                                        .Update(ingredient);
            return response.Models.FirstOrDefault();
        }

        public async Task<bool> DeleteIngredientAsync(int id)
        {
            var response = await _client.From<Ingredient>()
                                        .Where(i => i.Id == id)
                                        .Get();
            if (!response.Models.Any())
                return false;
            await _client.From<Ingredient>()
                                        .Where(i => i.Id == id)
                                        .Delete();
            return true;
        }

        public async Task<IEnumerable<Item>> GetItemsAsync(int limit = 500)
        {
            var itemsResponse = await _client.From<Item>()
                                        .Select("*")
                                        .Limit(limit)
                                        .Get();

            var items = itemsResponse.Models;
            if (!items.Any())
                return items;

            var itemIds = items.Select(i => i.Id).ToList();

            var linksResponse = await _client.From<Ingredients2Items>()
                                             .Select("*")
                                             .Get();
            var links = linksResponse.Models.Where(l => itemIds.Contains(l.Item_Id)).ToList();

            var ingredientIds = links.Select(l => l.Ingredient_Id).Distinct().ToList();
            var ingredientCosts = new Dictionary<int, decimal>();

            if (ingredientIds.Any())
            {
                var ingredientsResponse = await _client.From<Ingredient>()
                                                       .Select("*")
                                                       .Filter(nameof(Ingredient.Id).ToLower(), Supabase.Postgrest.Constants.Operator.In, ingredientIds)
                                                       .Get();
                ingredientCosts = ingredientsResponse.Models.ToDictionary(i => i.Id, i => i.Cost_Per_Unit);
            }

            foreach (var item in items)
            {
                var total = links
                    .Where(l => l.Item_Id == item.Id)
                    .Sum(l =>
                    {
                        var qty = (decimal)l.Ingredient_Quantity;
                        var cost = ingredientCosts.TryGetValue(l.Ingredient_Id, out var c) ? c : 0m;
                        return qty * cost;
                    });

                item.Total_Cost = total;

                var price = (decimal)item.Price;
                item.Profit_Margin = price > 0 ? (price - total) / price : null;
            }

            return items;
        }

        public async Task<IEnumerable<Restaurant>> GetRestaurantsAsync(int limit = 100)
        {
            var response = await _client.From<Restaurant>()
                                        .Select("*")
                                        .Limit(limit)
                                        .Get();
            return response.Models;
        }
        
        public async Task<Restaurant?> GetRestaurantByIdAsync(int id)
        {
            var response = await _client.From<Restaurant>()
                                        .Where(i => i.Id == id)
                                        .Limit(1)
                                        .Get();
            return response.Models.FirstOrDefault();
        }

        public async Task<Restaurant?> CreateRestaurantAsync(Restaurant restaurant)
        {
            var response = await _client.From<Restaurant>()
                                        .Insert(restaurant);
            return response.Models.FirstOrDefault();
        }

        public async Task<Restaurant?> UpdateRestaurantAsync(int id, Restaurant restaurant)
        {
            var response = await _client.From<Restaurant>()
                                        .Where(i => i.Id == id)
                                        .Update(restaurant);
            return response.Models.FirstOrDefault();
        }

        public async Task<bool> DeleteRestaurantAsync(int id)
        {
            var response = await _client.From<Restaurant>()
                                        .Where(i => i.Id == id)
                                        .Get();
            if (!response.Models.Any())
                return false;
            await _client.From<Restaurant>()
                                        .Where(i => i.Id == id)
                                        .Delete();
            return true;
        }

        public async Task<UserProfile?> GetUserByIdAsync(int id)
        {
            var response = await _client.From<UserProfile>()
                                        .Where(i => i.Id == id)
                                        .Limit(1)
                                        .Get();
            return response.Models.FirstOrDefault();
        }

        public async Task<UserProfile?> CreateUserAsync(UserProfile user)
        {
            var response = await _client.From<UserProfile>()
                                        .Insert(user);
            return response.Models.FirstOrDefault();
        }

        public async Task<UserProfile?> UpdateUserAsync(int id, UserProfile user)
        {
            var response = await _client.From<UserProfile>()
                                        .Where(i => i.Id == id)
                                        .Update(user);
            return response.Models.FirstOrDefault();
        }

        public async Task<bool> DeleteUserAsync(int id)
        {
            var response = await _client.From<UserProfile>()
                                        .Where(i => i.Id == id)
                                        .Get();
            if (!response.Models.Any())
                return false;
            await _client.From<UserProfile>()
                                        .Where(i => i.Id == id)
                                        .Delete();
            return true;
        }

        public async Task<IEnumerable<Ingredients2Items>> GetIngredientsForItemAsync(int itemId)
        {
            var response = await _client.From<Ingredients2Items>()
                                        .Where(i => i.Item_Id == itemId)
                                        .Get();
            return response.Models;
        }

        public async Task<Ingredients2Items?> GetIngredientForItemAsync(int itemId, int ingredientId)
        {
            var response = await _client.From<Ingredients2Items>()
                                        .Where(i => i.Item_Id == itemId)
                                        .Where(i => i.Ingredient_Id == ingredientId)
                                        .Limit(1)
                                        .Get();
            return response.Models.FirstOrDefault();
        }

        public async Task<Ingredients2Items?> AddIngredientToItemAsync(Ingredients2Items link)
        {
            var response = await _client.From<Ingredients2Items>()
                                        .Insert(link);

            var created = response.Models.FirstOrDefault();
            if (created == null) return null;

            await RecalculateItemCostsAsync(link.Item_Id);
            return await GetIngredientForItemAsync(link.Item_Id, link.Ingredient_Id);
        }

        public async Task<Ingredients2Items?> UpdateIngredientQuantityAsync(int itemId, int ingredientId, float quantity)
        {
            var payload = new Ingredients2Items
            {
                Item_Id = itemId,
                Ingredient_Id = ingredientId,
                Ingredient_Quantity = quantity
            };

            await _client.From<Ingredients2Items>()
                        .Where(i => i.Item_Id == itemId)
                        .Where(i => i.Ingredient_Id == ingredientId)
                        .Update(payload);

            await RecalculateItemCostsAsync(itemId);
            return await GetIngredientForItemAsync(itemId, ingredientId);
        }

        public async Task<bool> DeleteIngredientFromItemAsync(int itemId, int ingredientId)
        {
            var existing = await _client.From<Ingredients2Items>()
                                        .Where(i => i.Item_Id == itemId)
                                        .Where(i => i.Ingredient_Id == ingredientId)
                                        .Get();
            if (!existing.Models.Any())
                return false;

            await _client.From<Ingredients2Items>()
                         .Where(i => i.Item_Id == itemId)
                         .Where(i => i.Ingredient_Id == ingredientId)
                         .Delete();

            await RecalculateItemCostsAsync(itemId);
            return true;
        }

        public async Task<Item?> GetItemBySquareVariationIdAsync(string squareVariationId, int restaurantId)
        {
            var response = await _client.From<Item>()
                .Where(i => i.Restaurant_Id == restaurantId && i.Square_Variation_Id == squareVariationId)
                .Limit(1)
                .Get();
            return response.Models.FirstOrDefault();
        }
        
        private async Task RecalculateItemCostsAsync(int itemId)
        {
            var itemResponse = await _client.From<Item>()
                .Where(i => i.Id == itemId)
                .Limit(1)
                .Get();

            var item = itemResponse.Models.FirstOrDefault();
            if (item == null) return;
            var price = (decimal)item.Price;

            var linksResponse = await _client.From<Ingredients2Items>()
                .Where(l => l.Item_Id == itemId)
                .Get();
            var links = linksResponse.Models;

            if (!links.Any())
            {
                item.Total_Cost = 0m;
                item.Profit_Margin = price > 0 ? (price - 0m) / price : null;
                await _client.From<Item>()
                    .Where(i => i.Id == itemId)
                    .Update(item);
                return;
            }

            var ingredientIds = links.Select(l => l.Ingredient_Id).Distinct().ToList();
            var ingredientCosts = new Dictionary<int, decimal>();
            if (ingredientIds.Any())
            {
                var ingredientsResponse = await _client.From<Ingredient>()
                    .Select("*")
                    .Filter(nameof(Ingredient.Id).ToLower(), Supabase.Postgrest.Constants.Operator.In, ingredientIds)
                    .Get();
                ingredientCosts = ingredientsResponse.Models.ToDictionary(i => i.Id, i => i.Cost_Per_Unit);
            }

            var total = links.Sum(link =>
            {
                var qty = (decimal)link.Ingredient_Quantity;
                var cost = ingredientCosts.TryGetValue(link.Ingredient_Id, out var c) ? c : 0m;
                return qty * cost;
            });

            item.Total_Cost = total;
            item.Profit_Margin = price > 0 ? (price - total) / price : null;

            await _client.From<Item>()
                .Where(i => i.Id == itemId)
                .Update(item);
        }

        public async Task<DateTimeOffset?> GetLastSquareOrderSyncAsync(int restaurantId)
        {
            var response = await _client.From<SquareSyncState>()
                .Where(s => s.Restaurant_Id == restaurantId)
                .Limit(1)
                .Get();
            var state = response.Models.FirstOrDefault();
            return state?.Last_Success_At;
        }

        public async Task SetLastSquareOrderSyncAsync(int restaurantId, DateTimeOffset timestamp)
        {
            var state = new SquareSyncState
            {
                Restaurant_Id = restaurantId,
                Last_Success_At = timestamp
            };

            // Upsert-like behavior: try update, if 0 rows then insert
            var existing = await _client.From<SquareSyncState>()
                .Where(s => s.Restaurant_Id == restaurantId)
                .Limit(1)
                .Get();

            if (existing.Models.Any())
            {
                await _client.From<SquareSyncState>()
                    .Where(s => s.Restaurant_Id == restaurantId)
                    .Update(state);
            }
            else
            {
                await _client.From<SquareSyncState>().Insert(state);
            }
        }

        public async Task<long> UpsertOrderAsync(OrderRecord order, IEnumerable<OrderLineItemRecord> lineItems)
        {
            // Find existing by Square order id
            var existingResponse = await _client.From<OrderRecord>()
                .Where(o => o.Square_Order_Id == order.Square_Order_Id)
                .Limit(1)
                .Get();

            OrderRecord? existing = existingResponse.Models.FirstOrDefault();

            if (existing is null)
            {
                var insertResp = await _client.From<OrderRecord>().Insert(order);
                var created = insertResp.Models.First();
                await ReplaceLineItemsAsync(created.Id, lineItems);
                return created.Id;
            }
            else
            {
                order.Id = existing.Id;
                await _client.From<OrderRecord>()
                    .Where(o => o.Id == existing.Id)
                    .Update(order);

                await ReplaceLineItemsAsync(existing.Id, lineItems);
                return existing.Id;
            }
        }

        public async Task DeductInventoryForOrderAsync(IEnumerable<OrderLineItemRecord> lineItems)
        {
            foreach (var line in lineItems)
            {
                if (line.Item_Id is null)
                    continue;

                var links = await GetIngredientsForItemAsync(line.Item_Id.Value);
                foreach (var link in links)
                {
                    var qtyUsed = (decimal)link.Ingredient_Quantity * line.Quantity;
                    // Update ingredient stock
                    var ingredientResp = await _client.From<Ingredient>()
                        .Where(i => i.Id == link.Ingredient_Id)
                        .Limit(1)
                        .Get();
                    var ingredient = ingredientResp.Models.FirstOrDefault();
                    if (ingredient is null) continue;

                    ingredient.Current_Stock -= qtyUsed;
                    if (ingredient.Current_Stock < 0) ingredient.Current_Stock = 0;

                    await _client.From<Ingredient>()
                        .Where(i => i.Id == ingredient.Id)
                        .Update(ingredient);

                    // Log usage
                    var log = new Inventory_Log
                    {
                        Ingredient_Id = ingredient.Id,
                        Date = DateTime.UtcNow,
                        Quantity_Used = (float)qtyUsed
                    };
                    await _client.From<Inventory_Log>().Insert(log);
                }
            }
        }

        private async Task ReplaceLineItemsAsync(long orderId, IEnumerable<OrderLineItemRecord> lineItems)
        {
            await _client.From<OrderLineItemRecord>()
                .Where(li => li.Order_Id == orderId)
                .Delete();

            var toInsert = lineItems.Select(li =>
            {
                li.Order_Id = orderId;
                return li;
            }).ToList();

            if (toInsert.Count > 0)
            {
                await _client.From<OrderLineItemRecord>().Insert(toInsert);
            }
        }

        public async Task<IEnumerable<TransactionView>> GetTransactionsAsync(int limit = 50)
        {
            var response = await _client.From<TransactionView>()
                .Select("*")
                .Order("square_created_at", Supabase.Postgrest.Constants.Ordering.Descending)
                .Limit(limit)
                .Get();

            return response.Models;
        }
    }
}
