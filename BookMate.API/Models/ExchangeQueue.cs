using System.ComponentModel.DataAnnotations.Schema;

namespace BookMate.API.Models
{
    public class ExchangeQueue
    {
        public Guid Id { get; set; }

        public Guid ListingId { get; set; }
        public Guid RequesterId { get; set; }

        public string Status { get; set; } = "Waiting";  // Waiting / Active / Passed / Withdrawn

        public DateTime RequestedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public Listing Listing { get; set; } = null!;

        [ForeignKey(nameof(RequesterId))]
        public User Requester { get; set; } = null!;
    }
}
