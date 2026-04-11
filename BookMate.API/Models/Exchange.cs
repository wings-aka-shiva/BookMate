using System.ComponentModel.DataAnnotations.Schema;

namespace BookMate.API.Models
{
    public class Exchange
    {
        public Guid Id { get; set; }

        public Guid ListingId { get; set; }
        public Guid RequesterId { get; set; }
        public Guid OwnerId { get; set; }

        public string Type { get; set; } = string.Empty;   // Swap / Temporary / PassItOn
        public string Status { get; set; } = "Pending";    // Pending / Accepted / Rejected / Completed / Returned / Defaulted

        public string? PickupLocation { get; set; }
        public DateTime? DueDate { get; set; }
        public bool ExtensionRequested { get; set; } = false;
        public DateTime? ExtendedDueDate { get; set; }
        public string? RejectionReason { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? CompletedAt { get; set; }

        // Navigation properties
        public Listing Listing { get; set; } = null!;

        [ForeignKey(nameof(RequesterId))]
        public User Requester { get; set; } = null!;

        [ForeignKey(nameof(OwnerId))]
        public User Owner { get; set; } = null!;
    }
}
