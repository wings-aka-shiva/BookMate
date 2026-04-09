namespace BookMate.API.DTOs
{
    public class CreateListingDto
    {
        public Guid BookId { get; set; }
        public string Condition { get; set; } = string.Empty;
        public string ExchangeType { get; set; } = string.Empty;
    }
}
