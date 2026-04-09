namespace BookMate.API.Models
{
    public class User
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public int ReputationScore { get; set; } = 0;
        public string? VisaStatus { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}