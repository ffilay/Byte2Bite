using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Extensions.Logging;
using Square;
using Square.Orders;

namespace backend.Services
{
    public class SquareOrderSyncService : ISquareOrderSyncService
    {
        private readonly SquareClient _square;
        private readonly ILogger<SquareOrderSyncService> _logger;
        private readonly List<string> _locationIds = new() { "LNFCWD2PQ2MGD" }; // TODO: make configurable

        public SquareOrderSyncService(SquareClient squareClient, ILogger<SquareOrderSyncService> logger)
        {
            _square = squareClient;
            _logger = logger;
        }

        /// <inheritdoc />
        public async Task<IReadOnlyList<Order>> FetchOrdersUpdatedSinceAsync(DateTimeOffset? updatedSince = null, CancellationToken cancellationToken = default)
        {
            var orderIds = new List<string>();
            string? cursor = null;

            do
            {
                var searchRequest = new SearchOrdersRequest
                {
                    Limit = 100,
                    Cursor = cursor,
                    ReturnEntries = true,
                    Query = new SearchOrdersQuery
                    {
                        Filter = updatedSince.HasValue
                            ? new SearchOrdersFilter
                            {
                                DateTimeFilter = new SearchOrdersDateTimeFilter
                                {
                                    UpdatedAt = new TimeRange
                                    {
                                        StartAt = updatedSince.Value.UtcDateTime.ToString("o")
                                    }
                                }
                            }
                            : null,
                        Sort = new SearchOrdersSort
                        {
                            SortField = SearchOrdersSortField.UpdatedAt,
                            SortOrder = SortOrder.Asc
                        }
                    },
                    LocationIds = _locationIds
                };

                var searchResponse = await _square.Orders.SearchAsync(searchRequest, cancellationToken: cancellationToken);

                if (searchResponse?.OrderEntries is not null)
                {
                    foreach (var entry in searchResponse.OrderEntries)
                    {
                        if (!string.IsNullOrWhiteSpace(entry.OrderId))
                        {
                            orderIds.Add(entry.OrderId);
                        }
                    }
                }
                else if (searchResponse?.Orders is not null)
                {
                    foreach (var order in searchResponse.Orders)
                    {
                        if (!string.IsNullOrWhiteSpace(order.Id))
                        {
                            orderIds.Add(order.Id);
                        }
                    }
                }

                cursor = searchResponse?.Cursor;
            }
            while (!string.IsNullOrWhiteSpace(cursor));

            if (orderIds.Count == 0)
            {
                return Array.Empty<Order>();
            }

            var results = new List<Order>();

            foreach (var chunk in orderIds.Distinct(StringComparer.Ordinal).Chunk(100))
            {
                try
                {
                    var batchResponse = await _square.Orders.BatchGetAsync(
                        new BatchGetOrdersRequest
                        {
                            OrderIds = chunk.ToList()
                        },
                        cancellationToken: cancellationToken);

                    if (batchResponse?.Orders is not null)
                    {
                        results.AddRange(batchResponse.Orders.Where(o => o is not null)!);
                    }
                }
                catch (SquareApiException ex)
                {
                    _logger.LogError(ex, "Square BatchGetOrders failed for {Count} order ids.", chunk.Count());
                }
            }

            return results;
        }

        private async Task EnsureLocationIdsAsync(CancellationToken cancellationToken)
        {
            // Static location id for now; remove once configuration-driven
            await Task.CompletedTask;
        }
    }
}
