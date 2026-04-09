using BookMate.API.Data;
using BookMate.API.Models;
using Microsoft.EntityFrameworkCore;

namespace BookMate.API.Repositories
{
    public class ListingRepository
    {
        private readonly AppDbContext _db;

        public ListingRepository(AppDbContext db)
        {
            _db = db;
        }

        public async Task<List<Listing>> GetAllAsync()
        {
            return await _db.Listings
                .Where(l => l.Status == "Active")
                .Include(l => l.User)
                .Include(l => l.Book)
                .ToListAsync();
        }

        public async Task<Listing?> GetByIdAsync(Guid id)
        {
            return await _db.Listings
                .Include(l => l.User)
                .Include(l => l.Book)
                .FirstOrDefaultAsync(l => l.Id == id);
        }

        public async Task<List<Listing>> GetByUserIdAsync(Guid userId)
        {
            return await _db.Listings
                .Where(l => l.UserId == userId)
                .Include(l => l.Book)
                .ToListAsync();
        }

        public async Task<List<Listing>> GetByBookIdAsync(Guid bookId)
        {
            return await _db.Listings
                .Where(l => l.BookId == bookId)
                .Include(l => l.User)
                .ToListAsync();
        }

        public async Task<List<Listing>> SearchAsync(string query)
        {
            var lower = query.ToLower();
            return await _db.Listings
                .Where(l => l.Status == "Active" && l.Book.Title.ToLower().Contains(lower))
                .Include(l => l.User)
                .Include(l => l.Book)
                .ToListAsync();
        }

        public async Task<Listing> CreateAsync(Listing listing)
        {
            _db.Listings.Add(listing);
            await _db.SaveChangesAsync();
            return listing;
        }

        public async Task<Listing?> UpdateStatusAsync(Guid id, string status)
        {
            var listing = await _db.Listings
                .Include(l => l.User)
                .Include(l => l.Book)
                .FirstOrDefaultAsync(l => l.Id == id);

            if (listing == null) return null;

            listing.Status = status;
            await _db.SaveChangesAsync();
            return listing;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var listing = await _db.Listings.FindAsync(id);
            if (listing == null) return false;

            _db.Listings.Remove(listing);
            return await _db.SaveChangesAsync() > 0;
        }
    }
}
