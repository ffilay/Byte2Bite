using Microsoft.AspNetCore.Mvc;
using backend.Services;
using backend.Dtos;
using backend.Models;
using AutoMapper;

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
    }
}