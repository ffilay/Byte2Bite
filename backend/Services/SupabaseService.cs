using BYTE2BITE.Models;

namespace BYTE2BITE.Services
{
    public class SupabaseService : ISupabaseService
    {
        private readonly Supabase.Client _client;

        public SupabaseService(Supabase.Client client)
        {
            _client = client;
        }

        public async Task<IEnumerable<Ingredient>> GetIngredientsAsync()
        {
            var response = await _client.From<Ingredient>()
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

        public async Task<Ingredient?> UpdateIngredientAsync(Ingredient ingredient)
        {
            var response = await _client.From<Ingredient>()
                                        .Where(i => i.Id == ingredient.Id)
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

        public Task<IEnumerable<Ingredient>> GetIngredientsAsync(int limit = 100)
        {
            throw new NotImplementedException();
        }
    }
}
