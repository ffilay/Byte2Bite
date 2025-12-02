using backend.Services;
using Microsoft.AspNetCore.Mvc;
using Square;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/orders")]
    public class OrderSyncController : ControllerBase
    {
        private readonly ISquareOrderSyncService _orderSync;
        private readonly ISupabaseService _supabase;
        private readonly ILogger<OrderSyncController> _logger;
        private const int RestaurantId = 1; // TODO: make configurable

        public OrderSyncController(ISquareOrderSyncService orderSync, ISupabaseService supabase, ILogger<OrderSyncController> logger)
        {
            _orderSync = orderSync;
            _supabase = supabase;
            _logger = logger;
        }

        /// <summary>
        /// Manually trigger a Square order sync. Defaults to last 120 minutes if no since is provided.
        /// </summary>
        [HttpPost("sync")]
        public async Task<IActionResult> Sync([FromQuery] int minutesBack = 120, CancellationToken cancellationToken = default)
        {
            var since = DateTimeOffset.UtcNow.AddMinutes(-Math.Abs(minutesBack));
            var orders = await _orderSync.FetchOrdersUpdatedSinceAsync(since, cancellationToken);

            var processed = 0;
            foreach (var order in orders)
            {
                try
                {
                    var mapped = await MapOrderAsync(order, cancellationToken);
                    await _supabase.UpsertOrderAsync(mapped.order, mapped.lineItems);
                    await _supabase.DeductInventoryForOrderAsync(mapped.lineItems);
                    processed++;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to process Square order {OrderId} during manual sync.", order.Id);
                }
            }

            await _supabase.SetLastSquareOrderSyncAsync(RestaurantId, DateTimeOffset.UtcNow);

            return Ok(new { processed, fetched = orders.Count, since });
        }

        private async Task<(backend.Models.OrderRecord order, List<backend.Models.OrderLineItemRecord> lineItems)> MapOrderAsync(Order order, CancellationToken cancellationToken)
        {
            var orderRecord = new backend.Models.OrderRecord
            {
                Restaurant_Id = RestaurantId,
                Square_Order_Id = order.Id ?? string.Empty,
                State = order.State?.Value ?? string.Empty,
                Total_Money_Cents = order.TotalMoney?.Amount ?? 0,
                Currency = order.TotalMoney?.Currency?.Value ?? "USD",
                Location_Id = order.LocationId,
                Customer_Id = order.CustomerId,
                Square_Created_At = ParseDate(order.CreatedAt),
                Square_Updated_At = ParseDate(order.UpdatedAt),
                Version = order.Version
            };

            var lineItems = new List<backend.Models.OrderLineItemRecord>();

            if (order.LineItems != null)
            {
                foreach (var li in order.LineItems)
                {
                    var quantity = ParseQuantity(li.Quantity);
                    int? itemId = null;
                    if (!string.IsNullOrWhiteSpace(li.CatalogObjectId))
                    {
                        var item = await _supabase.GetItemBySquareVariationIdAsync(li.CatalogObjectId, RestaurantId);
                        itemId = item?.Id;
                    }

                    var line = new backend.Models.OrderLineItemRecord
                    {
                        Square_Line_Item_Uid = li.Uid ?? Guid.NewGuid().ToString(),
                        Square_Catalog_Object_Id = li.CatalogObjectId,
                        Item_Id = itemId,
                        Name = li.Name ?? string.Empty,
                        Quantity = quantity,
                        Base_Price_Cents = li.BasePriceMoney?.Amount,
                        Total_Money_Cents = li.TotalMoney?.Amount
                    };

                    lineItems.Add(line);
                }
            }

            return (orderRecord, lineItems);
        }

        private static DateTimeOffset? ParseDate(string? value)
        {
            if (string.IsNullOrWhiteSpace(value)) return null;
            return DateTimeOffset.TryParse(value, out var dt) ? dt : null;
        }

        private static decimal ParseQuantity(string? value)
        {
            if (string.IsNullOrWhiteSpace(value)) return 0;
            return decimal.TryParse(value, out var q) ? q : 0;
        }
    }
}
