using BookMate.API.Data;
using BookMate.API.Models;
using Microsoft.EntityFrameworkCore;

namespace BookMate.API.Repositories
{
    public class ExchangeRepository : IExchangeRepository
    {
        private readonly AppDbContext _db;

        public ExchangeRepository(AppDbContext db)
        {
            _db = db;
        }

        public async Task<Exchange> CreateAsync(Exchange exchange)
        {
            _db.Exchanges.Add(exchange);
            await _db.SaveChangesAsync();
            return exchange;
        }

        public async Task<Exchange?> GetByIdAsync(Guid id)
        {
            return await _db.Exchanges
                .Include(e => e.Listing)
                    .ThenInclude(l => l.Book)
                .Include(e => e.Requester)
                .Include(e => e.Owner)
                .FirstOrDefaultAsync(e => e.Id == id);
        }

        public async Task<List<Exchange>> GetByUserIdAsync(Guid userId)
        {
            return await _db.Exchanges
                .Where(e => e.RequesterId == userId || e.OwnerId == userId)
                .Include(e => e.Listing)
                    .ThenInclude(l => l.Book)
                .Include(e => e.Requester)
                .Include(e => e.Owner)
                .ToListAsync();
        }

        public async Task UpdateAsync(Exchange exchange)
        {
            _db.Exchanges.Update(exchange);
            await _db.SaveChangesAsync();
        }

        public async Task<int> GetActiveQueueCountAsync(Guid requesterId)
        {
            return await _db.ExchangeQueues
                .CountAsync(q => q.RequesterId == requesterId &&
                                 (q.Status == "Waiting" || q.Status == "Active"));
        }

        public async Task<ExchangeQueue?> GetQueueEntryAsync(Guid listingId, Guid requesterId)
        {
            return await _db.ExchangeQueues
                .FirstOrDefaultAsync(q => q.ListingId == listingId && q.RequesterId == requesterId);
        }

        public async Task<ExchangeQueue> AddToQueueAsync(ExchangeQueue entry)
        {
            _db.ExchangeQueues.Add(entry);
            await _db.SaveChangesAsync();
            return entry;
        }

        public async Task<ExchangeQueue?> GetNextInQueueAsync(Guid listingId)
        {
            return await _db.ExchangeQueues
                .Where(q => q.ListingId == listingId && q.Status == "Waiting")
                .OrderBy(q => q.RequestedAt)
                .FirstOrDefaultAsync();
        }

        public async Task UpdateQueueEntryAsync(ExchangeQueue entry)
        {
            _db.ExchangeQueues.Update(entry);
            await _db.SaveChangesAsync();
        }
    }
}
