using Microsoft.AspNetCore.Mvc;
using backend.Services;
using backend.Dtos;
using AutoMapper;

namespace backend.Controllers
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
            var dtos = _mapper.Map<IEnumerable<ReadIngredientDto>>(ingredients);
            return Ok(dtos);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> Get(int id)
        {
            var ingredient = await _supabase.GetIngredientByIdAsync(id);
            var dto = _mapper.Map<ReadIngredientDto>(ingredient);
            return ingredient == null ? NotFound() : Ok(dto);
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
