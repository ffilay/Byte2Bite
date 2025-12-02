using Square;

namespace backend.Services
{
    public interface ISquareOrderSyncService
    {
        /// <summary>
        /// Retrieves Square orders updated since the given timestamp (inclusive) using Search + BatchGet.
        /// If no timestamp is provided, retrieves the most recent page of orders from Square.
        /// </summary>
        Task<IReadOnlyList<Order>> FetchOrdersUpdatedSinceAsync(DateTimeOffset? updatedSince = null, CancellationToken cancellationToken = default);
    }
}
