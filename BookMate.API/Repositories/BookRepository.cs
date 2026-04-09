using BookMate.API.Data;
using BookMate.API.Models;
using Microsoft.EntityFrameworkCore;

namespace BookMate.API.Repositories
{
    public class BookRepository
    {
        private readonly AppDbContext _db;

        public BookRepository(AppDbContext db)
        {
            _db = db;
        }

        public async Task<List<Book>> GetAllAsync()
        {
            return await _db.Books.ToListAsync();
        }

        public async Task<Book?> GetByIdAsync(Guid id)
        {
            return await _db.Books.FindAsync(id);
        }

        public async Task<Book?> GetByIsbnAsync(string isbn)
        {
            return await _db.Books.FirstOrDefaultAsync(b => b.Isbn == isbn);
        }

        public async Task<Book> CreateAsync(Book book)
        {
            _db.Books.Add(book);
            await _db.SaveChangesAsync();
            return book;
        }

        public async Task<bool> ExistsAsync(string isbn)
        {
            return await _db.Books.AnyAsync(b => b.Isbn == isbn);
        }
    }
}
