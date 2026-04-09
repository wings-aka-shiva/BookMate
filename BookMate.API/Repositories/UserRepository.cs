using BookMate.API.Data;
using BookMate.API.Models;

namespace BookMate.API.Repositories
{
    public class UserRepository
    {
        private readonly AppDbContext _db;

        public UserRepository(AppDbContext db)
        {
            _db = db;
        }

        public async Task<User?> GetByIdAsync(Guid id)
        {
            return await _db.Users.FindAsync(id);
        }

        public async Task<bool> UpdateAsync(User user)
        {
            _db.Users.Update(user);
            return await _db.SaveChangesAsync() > 0;
        }

        public async Task<bool> ArchiveAsync(Guid id)
        {
            return await Task.FromResult(true);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var user = await _db.Users.FindAsync(id);
            if (user == null) return false;

            _db.Users.Remove(user);
            return await _db.SaveChangesAsync() > 0;
        }
    }
}
