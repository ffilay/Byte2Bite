using Microsoft.AspNetCore.Mvc;
using backend.Services;
using backend.Dtos;
using backend.Models;
using AutoMapper;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/users")]
    public class UserController : ControllerBase
    {
        private readonly ISupabaseService _supabase;
        private readonly IMapper _mapper;

        public UserController(ISupabaseService supabase, IMapper mapper)
        {
            _supabase = supabase;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var users = await _supabase.GetUsersAsync();
            var dtos = _mapper.Map<IEnumerable<UserDto>>(users);
            return Ok(dtos);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> Get(int id)
        {
            var user = await _supabase.GetUserByIdAsync(id);
            var dto = _mapper.Map<UserDto>(user);
            return user == null ? NotFound() : Ok(dto);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] UserDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var user = _mapper.Map<UserProfile>(dto);
            var create = await _supabase.CreateUserAsync(user);
            if (create == null) return StatusCode(500, "Failed to create user");
            var readDto = _mapper.Map<UserDto>(create);
            return CreatedAtAction(nameof(Get), new { id = readDto.Id }, readDto);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UserDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var user = _mapper.Map<UserProfile>(dto);
            var updated = await _supabase.UpdateUserAsync(id, user);
            return updated == null ? NotFound() : Ok(_mapper.Map<UserDto>(updated));
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var ok = await _supabase.DeleteUserAsync(id);
            return !ok ? NotFound() : NoContent();
        }
    }
}
