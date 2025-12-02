using backend.Models;
using Supabase;
using System.Linq;

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

        public async Task<IEnumerable<Item>> GetItemsAsync(int limit = 100)
        {
            var response = await _client.From<Item>()
                                        .Select("*")
                                        .Limit(limit)
                                        .Get();
            return response.Models;
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
            return true;
        }
    }
}
