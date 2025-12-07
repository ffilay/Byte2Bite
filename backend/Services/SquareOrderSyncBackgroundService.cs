using System;
using System.Collections.Generic;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Square;
using Square.Orders;
using backend.Models;

namespace backend.Services
{
    /// <summary>
    /// Periodically pulls recent Square orders. Intended to run every 5 minutes.
    /// Currently only fetches and logs; persistence/inventory deduction can plug in here.
    /// </summary>
    public class SquareOrderSyncBackgroundService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<SquareOrderSyncBackgroundService> _logger;
        private static readonly TimeSpan Interval = TimeSpan.FromMinutes(5);
        private const int RestaurantId = 1; // TODO: make configurable

        public SquareOrderSyncBackgroundService(IServiceScopeFactory scopeFactory, ILogger<SquareOrderSyncBackgroundService> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            // Small initial delay to let the app start cleanly
            try
            {
                await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
            }
            catch (TaskCanceledException)
            {
                return;
            }

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await SyncOnce(stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Square order sync cycle failed.");
                }

                try
                {
                    await Task.Delay(Interval, stoppingToken);
                }
                catch (TaskCanceledException)
                {
                    break;
                }
            }
        }

        private async Task SyncOnce(CancellationToken cancellationToken)
        {
            await using var scope = _scopeFactory.CreateAsyncScope();
            var orderSync = scope.ServiceProvider.GetRequiredService<ISquareOrderSyncService>();
            var supabase = scope.ServiceProvider.GetRequiredService<ISupabaseService>();

            var lastSync = await supabase.GetLastSquareOrderSyncAsync(RestaurantId);

            // If no prior sync, initialize the marker to "now" and skip ingesting historical orders.
            if (lastSync is null)
            {
                var now = DateTimeOffset.UtcNow;
                await supabase.SetLastSquareOrderSyncAsync(RestaurantId, now);
                _logger.LogInformation("Initialized Square order sync marker at {Now}; skipping historical import.", now);
                return;
            }

            var orders = await orderSync.FetchOrdersUpdatedSinceAsync(lastSync, cancellationToken);

            foreach (var order in orders)
            {
                try
                {
                    var mapped = await MapOrderAsync(order, supabase, cancellationToken);
                    var orderId = await supabase.UpsertOrderAsync(mapped.order, mapped.lineItems);
                    await supabase.DeductInventoryForOrderAsync(mapped.lineItems);
                    _logger.LogInformation("Upserted Square order {SquareOrderId} -> local {OrderId}, {LineCount} lines.", mapped.order.Square_Order_Id, orderId, mapped.lineItems.Count);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to process Square order {OrderId}.", order.Id);
                }
            }

            // Update last successful sync
            await supabase.SetLastSquareOrderSyncAsync(RestaurantId, DateTimeOffset.UtcNow);

            _logger.LogInformation("Square order sync finished, {Count} order(s) processed.", orders.Count);
        }

        private static async Task<(OrderRecord order, List<OrderLineItemRecord> lineItems)> MapOrderAsync(Order order, ISupabaseService supabase, CancellationToken cancellationToken)
        {
            var orderRecord = new OrderRecord
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

            var lineItems = new List<OrderLineItemRecord>();

            if (order.LineItems != null)
            {
                foreach (var li in order.LineItems)
                {
                    var quantity = ParseQuantity(li.Quantity);
                    int? itemId = null;
                    if (!string.IsNullOrWhiteSpace(li.CatalogObjectId))
                    {
                        var item = await supabase.GetItemBySquareVariationIdAsync(li.CatalogObjectId, RestaurantId);
                        itemId = item?.Id;
                    }

                    var line = new OrderLineItemRecord
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
