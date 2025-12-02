using Microsoft.AspNetCore.Mvc;
using backend.Services;
using Square;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly ISquareOrderSyncService _orderSync;
        private readonly ILogger<OrdersController> _logger;

        public OrdersController(ISquareOrderSyncService orderSync, ILogger<OrdersController> logger)
        {
            _orderSync = orderSync;
            _logger = logger;
        }

        /// <summary>
        /// Retrieves Square orders updated since the provided timestamp (UTC ISO-8601). If omitted, gets the most recent page.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<Order>>> Get([FromQuery] string? updatedSince, CancellationToken cancellationToken)
        {
            DateTimeOffset? since = null;
            if (!string.IsNullOrWhiteSpace(updatedSince))
            {
                if (!DateTimeOffset.TryParse(updatedSince, out var parsed))
                {
                    return BadRequest("Invalid updatedSince format. Use ISO-8601, e.g., 2024-01-01T00:00:00Z.");
                }
                since = parsed;
            }

            try
            {
                var orders = await _orderSync.FetchOrdersUpdatedSinceAsync(since, cancellationToken);
                return Ok(orders);
            }
            catch (SquareApiException ex)
            {
                _logger.LogError(ex, "Square order fetch failed.");
                return StatusCode(StatusCodes.Status502BadGateway, ex.Message);
            }
        }
    }
}
