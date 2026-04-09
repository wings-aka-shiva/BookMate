namespace BookMate.API.Models
{
    public class Book
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public string Isbn { get; set; } = string.Empty;
        public string Genre { get; set; } = string.Empty;
        public int PublishedYear { get; set; }
        public string? CoverImage { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<Listing> Listings { get; set; } = new List<Listing>();
    }
}
