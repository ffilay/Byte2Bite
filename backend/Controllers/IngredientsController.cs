using Microsoft.AspNetCore.Mvc;
using BYTE2BITE.Services;
using AutoMapper;

namespace BYTE2BITE.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class IngredientsController : ControllerBase
    {
        private readonly ISupabaseService _supabase;
        private readonly IMapper _mapper;

        public IngredientsController(ISupabaseService supabase, IMapper mapper)
        {
            _supabase = supabase;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var ingredients = await _supabase.GetIngredientsAsync();
            return Ok(ingredients);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> Get(int id)
        {
            var ingredient = await _supabase.GetIngredientByIdAsync(id);
            return ingredient == null ? NotFound() : Ok(ingredient);
        }

        //implement method to add new ingredient and update existing
        //[HttpPost]

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var ok = await _supabase.DeleteIngredientAsync(id);
            return !ok ? NotFound() : NoContent();
        }
    }
}
