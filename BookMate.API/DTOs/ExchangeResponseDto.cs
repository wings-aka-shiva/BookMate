namespace BookMate.API.DTOs
{
    public class ExchangeResponseDto
    {
        public Guid Id { get; set; }
        public Guid ListingId { get; set; }
        public string BookTitle { get; set; } = string.Empty;
        public Guid RequesterId { get; set; }
        public string RequesterName { get; set; } = string.Empty;
        public Guid OwnerId { get; set; }
        public string OwnerName { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? PickupLocation { get; set; }
        public DateTime? DueDate { get; set; }
        public bool ExtensionRequested { get; set; }
        public DateTime? ExtendedDueDate { get; set; }
        public string? RejectionReason { get; set; }
        public bool HandoverConfirmedByOwner { get; set; }
        public bool HandoverConfirmedByRequester { get; set; }
        public bool ReturnConfirmedByRequester { get; set; }
        public bool ReturnConfirmedByOwner { get; set; }
        public string? ReturnLocation { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
    }
}
