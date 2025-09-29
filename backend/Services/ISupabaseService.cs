using BYTE2BITE.Models;

namespace BYTE2BITE.Services
{
    public interface ISupabaseService
    {
        Task<IEnumerable<Ingredient>> GetIngredientsAsync(int limit = 100);
        Task<Ingredient?> GetIngredientByIdAsync(int id);
        Task<Ingredient?> CreateIngredientAsync(Ingredient ingredient);
        Task<bool> DeleteIngredientAsync(int id);
    }
}
