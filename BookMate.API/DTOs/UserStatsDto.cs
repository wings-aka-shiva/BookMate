namespace BookMate.API.DTOs
{
    public class UserStatsDto
    {
        public int BooksListed { get; set; }
        public int BooksSwapped { get; set; }
        public int BooksLent { get; set; }
        public int BooksDonated { get; set; }
        public int ReturnsOnTime { get; set; }
        public int Defaults { get; set; }
        public int BadgesEarned { get; set; }
        public int ReputationScore { get; set; }
    }
}
