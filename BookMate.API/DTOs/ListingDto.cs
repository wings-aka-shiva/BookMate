namespace BookMate.API.DTOs
{
    public class ListingDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string UserDisplayName { get; set; } = string.Empty;
        public Guid BookId { get; set; }
        public string BookTitle { get; set; } = string.Empty;
        public string BookAuthor { get; set; } = string.Empty;
        public string? CoverImage { get; set; }
        public string Condition { get; set; } = string.Empty;
        public string ExchangeType { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime ListedAt { get; set; }
        public DateTime ExpiresAt { get; set; }
    }
}
