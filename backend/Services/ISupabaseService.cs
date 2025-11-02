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
    }
}
