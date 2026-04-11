using BookMate.API.Models;

namespace BookMate.API.Repositories
{
    public interface IExchangeRepository
    {
        Task<Exchange> CreateAsync(Exchange exchange);
        Task<Exchange?> GetByIdAsync(Guid id);
        Task<List<Exchange>> GetByUserIdAsync(Guid userId);
        Task UpdateAsync(Exchange exchange);
        Task<int> GetActiveQueueCountAsync(Guid requesterId);
        Task<ExchangeQueue?> GetQueueEntryAsync(Guid listingId, Guid requesterId);
        Task<ExchangeQueue> AddToQueueAsync(ExchangeQueue entry);
        Task<ExchangeQueue?> GetNextInQueueAsync(Guid listingId);
        Task UpdateQueueEntryAsync(ExchangeQueue entry);
    }
}
