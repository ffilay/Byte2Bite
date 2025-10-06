using Microsoft.AspNetCore.Mvc;
using backend.Services;
using backend.Dtos;
using backend.Models;
using AutoMapper;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/ingredients")]
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

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] WriteIngredientDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var ingredient = _mapper.Map<Ingredient>(dto);
            var create = await _supabase.CreateIngredientAsync(ingredient);
            if (create == null) return StatusCode(500, "Failed to create ingredient");
            var readDto = _mapper.Map<ReadIngredientDto>(create);
            return CreatedAtAction(nameof(Get), new { id = readDto.Id }, readDto);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] WriteIngredientDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var ingredient = _mapper.Map<Ingredient>(dto);
            var updated = await _supabase.UpdateIngredientAsync(id, ingredient);
            return updated == null ? NotFound() : Ok(_mapper.Map<ReadIngredientDto>(updated));
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var ok = await _supabase.DeleteIngredientAsync(id);
            return !ok ? NotFound() : NoContent();
        }
    }
}
