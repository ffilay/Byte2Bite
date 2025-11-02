using backend.Models;

namespace backend.Services
{
    public interface ISupabaseService
    {
        Task<IEnumerable<Ingredient>> GetIngredientsAsync(int limit = 100);
        Task<Ingredient?> GetIngredientByIdAsync(int id);
        Task<Ingredient?> CreateIngredientAsync(Ingredient ingredient);
        Task<Ingredient?> UpdateIngredientAsync(int id, Ingredient ingredient);
        Task<bool> DeleteIngredientAsync(int id);
        Task<IEnumerable<Item>> GetItemsAsync(int limit = 100);
    }
}
