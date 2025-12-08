using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Mvc;
using static Supabase.Postgrest.Constants;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TransactionsController : ControllerBase
    {
        private readonly ISupabaseService _supabaseService;
        private const int RestaurantId = 1; // TODO: make configurable

        public TransactionsController(ISupabaseService supabaseService)
        {
            _supabaseService = supabaseService;
        }

        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] int limit = 50, CancellationToken cancellationToken = default)
        {
            // Fetch recent orders directly and then fetch their line items; avoids view/RLS issues.
            var client = _supabaseService.Client;

            var ordersResp = await client.From<OrderRecord>()
                .Order(nameof(OrderRecord.Square_Created_At).ToLower(), Ordering.Descending)
                .Limit(limit)
                .Get(cancellationToken: cancellationToken);

            var orders = ordersResp.Models;

            var result = new List<object>();

            foreach (var order in orders)
            {
                var linesResp = await client.From<OrderLineItemRecord>()
                    .Where(li => li.Order_Id == order.Id)
                    .Get(cancellationToken: cancellationToken);

                var lines = linesResp.Models.Select(li => new
                {
                    line_item_id = li.Id,
                    name = li.Name,
                    quantity = li.Quantity,
                    base_price_cents = li.Base_Price_Cents,
                    total_money_cents = li.Total_Money_Cents,
                    item_id = li.Item_Id
                }).ToList();

                result.Add(new
                {
                    order_pk = order.Id,
                    square_order_id = order.Square_Order_Id,
                    restaurant_id = order.Restaurant_Id,
                    state = order.State,
                    total_money_cents = order.Total_Money_Cents,
                    currency = order.Currency,
                    square_created_at = order.Square_Created_At,
                    square_updated_at = order.Square_Updated_At,
                    line_items = lines
                });
            }

            return Ok(result);
        }

        [HttpGet("last-sync")]
        public async Task<IActionResult> GetLastSync(CancellationToken cancellationToken = default)
        {
            var last = await _supabaseService.GetLastSquareOrderSyncAsync(RestaurantId);
            return Ok(new { last_success_at = last });
        }
    }
}
