using BookMate.API.Models;

using Microsoft.EntityFrameworkCore;

namespace BookMate.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Book> Books { get; set; }
        public DbSet<Listing> Listings { get; set; }
        public DbSet<Exchange> Exchanges => Set<Exchange>();
        public DbSet<ExchangeQueue> ExchangeQueues => Set<ExchangeQueue>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Exchange>()
                .HasOne(e => e.Requester)
                .WithMany()
                .HasForeignKey(e => e.RequesterId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Exchange>()
                .HasOne(e => e.Owner)
                .WithMany()
                .HasForeignKey(e => e.OwnerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ExchangeQueue>()
                .HasOne(q => q.Requester)
                .WithMany()
                .HasForeignKey(q => q.RequesterId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}