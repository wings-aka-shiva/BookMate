namespace BookMate.API.Models
{
    public class Listing
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public Guid BookId { get; set; }
        public string Condition { get; set; } = string.Empty;
        public string ExchangeType { get; set; } = string.Empty;
        public string Status { get; set; } = "Active";
        public DateTime ListedAt { get; set; } = DateTime.UtcNow;
        public DateTime ExpiresAt { get; set; }

        public User User { get; set; } = null!;
        public Book Book { get; set; } = null!;
    }
}
