namespace BookMate.API.DTOs
{
    public class RequestExchangeDto
    {
        public Guid ListingId { get; set; }
        public string Type { get; set; } = string.Empty;
    }
}
