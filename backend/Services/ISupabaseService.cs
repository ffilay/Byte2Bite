using backend.Models;
using Supabase;

namespace backend.Services
{
    public interface ISupabaseService
    {
        Client Client { get; }
        Task<IEnumerable<Ingredient>> GetIngredientsAsync(int limit = 100);
        Task<Ingredient?> GetIngredientByIdAsync(int id);
        Task<Ingredient?> CreateIngredientAsync(Ingredient ingredient);
        Task<Ingredient?> UpdateIngredientAsync(int id, Ingredient ingredient);
        Task<bool> DeleteIngredientAsync(int id);
        Task<IEnumerable<Restaurant>> GetRestaurantsAsync(int limit = 100);
        Task<Restaurant?> GetRestaurantByIdAsync(int id);
        Task<Restaurant?> CreateRestaurantAsync(Restaurant restaurant);
        Task<Restaurant?> UpdateRestaurantAsync(int id, Restaurant restaurant);
        Task<bool> DeleteRestaurantAsync(int id);
        Task<UserProfile?> GetUserByIdAsync(int id);
        Task<UserProfile?> CreateUserAsync(UserProfile user);
        Task<UserProfile?> UpdateUserAsync(int id, UserProfile user);
        Task<bool> DeleteUserAsync(int id);
        Task<IEnumerable<Item>> GetItemsAsync(int limit = 500);
        Task<IEnumerable<Ingredients2Items>> GetIngredientsForItemAsync(int itemId);
        Task<Ingredients2Items?> GetIngredientForItemAsync(int itemId, int ingredientId);
        Task<Ingredients2Items?> AddIngredientToItemAsync(Ingredients2Items link);
        Task<Ingredients2Items?> UpdateIngredientQuantityAsync(int itemId, int ingredientId, float quantity);
        Task<bool> DeleteIngredientFromItemAsync(int itemId, int ingredientId);

        Task<Item?> GetItemBySquareVariationIdAsync(string squareVariationId, int restaurantId);
        Task<DateTimeOffset?> GetLastSquareOrderSyncAsync(int restaurantId);
        Task SetLastSquareOrderSyncAsync(int restaurantId, DateTimeOffset timestamp);
        Task<long> UpsertOrderAsync(OrderRecord order, IEnumerable<OrderLineItemRecord> lineItems);
        Task DeductInventoryForOrderAsync(IEnumerable<OrderLineItemRecord> lineItems);
        Task<IEnumerable<TransactionView>> GetTransactionsAsync(int limit = 50);
    }
}
