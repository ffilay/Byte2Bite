using System.Threading;
using System.Threading.Tasks;

namespace backend.Services
{
    public interface ISquareMenuSyncService
    {
        Task<int> ImportMenuItemsAsync(int restaurantId, CancellationToken cancellationToken = default);
    }
}

