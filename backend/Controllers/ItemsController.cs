using Microsoft.AspNetCore.Mvc;
using backend.Services;
using backend.Dtos;
using backend.Models;
using AutoMapper;
using System.Linq;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/items")]
    public class ItemsController : ControllerBase
    {
        private readonly ISupabaseService _supabase;
        private readonly IMapper _mapper;

        public ItemsController(ISupabaseService supabase, IMapper mapper)
        {
            _supabase = supabase;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var items = await _supabase.GetItemsAsync();
            var dtos = _mapper.Map<IEnumerable<ItemDto>>(items);
            return Ok(dtos);
        }

        [HttpGet("{id:int}/ingredients")]
        public async Task<IActionResult> GetIngredientsForItem(int id)
        {
            var links = await _supabase.GetIngredientsForItemAsync(id);
            var dtos = links.Select(MapLinkToDto);
            return Ok(dtos);
        }

        [HttpPost("{id:int}/ingredients")]
        public async Task<IActionResult> AddIngredientToItem(int id, [FromBody] CreateItemIngredientDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            if (dto.Quantity <= 0) return BadRequest("Quantity must be greater than zero.");

            var existing = await _supabase.GetIngredientForItemAsync(id, dto.IngredientId);
            if (existing != null) return Conflict("Ingredient already linked to this item.");

            var created = await _supabase.AddIngredientToItemAsync(new Ingredients2Items
            {
                Item_Id = id,
                Ingredient_Id = dto.IngredientId,
                Ingredient_Quantity = dto.Quantity
            });

            if (created == null) return StatusCode(500, "Failed to add ingredient to item.");

            var readDto = MapLinkToDto(created);
            return CreatedAtAction(nameof(GetIngredientsForItem), new { id }, readDto);
        }

        [HttpPut("{id:int}/ingredients/{ingredientId:int}")]
        public async Task<IActionResult> UpdateIngredientQuantity(
            int id,
            int ingredientId,
            [FromBody] UpdateItemIngredientDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            if (dto.Quantity <= 0) return BadRequest("Quantity must be greater than zero.");

            var updated = await _supabase.UpdateIngredientQuantityAsync(id, ingredientId, dto.Quantity);
            return updated == null ? NotFound() : Ok(MapLinkToDto(updated));
        }

        [HttpDelete("{id:int}/ingredients/{ingredientId:int}")]
        public async Task<IActionResult> RemoveIngredientFromItem(int id, int ingredientId)
        {
            var exists = await _supabase.GetIngredientForItemAsync(id, ingredientId);
            if (exists == null) return NotFound();

            var ok = await _supabase.DeleteIngredientFromItemAsync(id, ingredientId);
            return ok ? NoContent() : StatusCode(500, "Failed to remove ingredient from item.");
        }

        private static ItemIngredientDto MapLinkToDto(Ingredients2Items link)
        {
            return new ItemIngredientDto(
                link.Ingredient_Id,
                link.Ingredient_Quantity,
                link.Ingredient?.Name,
                link.Ingredient?.Unit
            );
        }
    }
}
