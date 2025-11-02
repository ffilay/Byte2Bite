using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Mvc;
using Supabase;
using System.Threading.Tasks;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/square")]
    public class SquareController : ControllerBase
    {
        private readonly SquareOAuthService _oauthService;
        private readonly Supabase.Client _supabase;

        public SquareController(SquareOAuthService oauthService, ISupabaseService supabaseService)
        {
            _oauthService = oauthService;
            _supabase = supabaseService.Client;
        }

        /// <summary>
        /// Endpoint to link a Square account to a restaurant.
        /// Frontend sends the OAuth 'code' received from Square and the restaurantId.
        /// </summary>
        [HttpPost("link")]
        public async Task<IActionResult> LinkSquare([FromBody] SquareLinkRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Code))
                return BadRequest("Missing Square OAuth code.");

            if (request.RestaurantId <= 0)
                return BadRequest("Invalid restaurantId.");

            // 1️⃣ Exchange the OAuth code for an access token and merchant ID
            var (accessToken, merchantId) = await _oauthService.ExchangeSquareCodeAsync(request.Code);

            // 2️⃣ Update the restaurant row in Supabase with Square credentials
            var restaurantResponse = await _supabase
                .From<Restaurant>()
                .Where(r => r.Id == request.RestaurantId)
                .Update(new Restaurant
                {
                    SquareAccessToken = accessToken,
                    SquareId = merchantId
                });

            if (restaurantResponse.Models.Count == 0)
                return NotFound("Restaurant not found or failed to update.");

            // 3️⃣ Return success
            return Ok(new
            {
                message = "Square account linked successfully",
                restaurantId = request.RestaurantId
            });
        }
    }

    /// <summary>
    /// DTO for linking a Square account
    /// </summary>
    public record SquareLinkRequest(string Code, int RestaurantId);
}
