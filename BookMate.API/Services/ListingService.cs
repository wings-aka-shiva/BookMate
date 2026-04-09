using BookMate.API.DTOs;
using BookMate.API.Models;
using BookMate.API.Repositories;

namespace BookMate.API.Services
{
    public class ListingService
    {
        private readonly ListingRepository _listingRepo;
        private readonly UserRepository _userRepo;

        public ListingService(ListingRepository listingRepo, UserRepository userRepo)
        {
            _listingRepo = listingRepo;
            _userRepo = userRepo;
        }

        public async Task<List<ListingDto>> GetAllAsync()
        {
            var listings = await _listingRepo.GetAllAsync();
            return listings.Select(MapToDto).ToList();
        }

        public async Task<ListingDto?> GetByIdAsync(Guid id)
        {
            var listing = await _listingRepo.GetByIdAsync(id);
            return listing == null ? null : MapToDto(listing);
        }

        public async Task<List<ListingDto>> GetByBookIdAsync(Guid bookId)
        {
            var listings = await _listingRepo.GetByBookIdAsync(bookId);
            return listings.Select(MapToDto).ToList();
        }

        public async Task<List<ListingDto>> SearchAsync(string query)
        {
            var listings = await _listingRepo.SearchAsync(query);
            return listings.Select(MapToDto).ToList();
        }

        public async Task<ListingDto> CreateAsync(Guid userId, CreateListingDto dto)
        {
            var listing = new Listing
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                BookId = dto.BookId,
                Condition = dto.Condition,
                ExchangeType = dto.ExchangeType,
                ExpiresAt = DateTime.UtcNow.AddDays(7)
            };

            var created = await _listingRepo.CreateAsync(listing);

            var user = await _userRepo.GetByIdAsync(userId);
            if (user != null)
            {
                user.ReputationScore += 5;
                await _userRepo.UpdateAsync(user);
            }

            // Reload with navigation properties
            var full = await _listingRepo.GetByIdAsync(created.Id);
            return MapToDto(full!);
        }

        public async Task<ListingDto?> UpdateStatusAsync(Guid id, string status)
        {
            var listing = await _listingRepo.UpdateStatusAsync(id, status);
            return listing == null ? null : MapToDto(listing);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            return await _listingRepo.DeleteAsync(id);
        }

        private static ListingDto MapToDto(Listing l) => new ListingDto
        {
            Id = l.Id,
            UserId = l.UserId,
            UserDisplayName = l.User?.DisplayName ?? string.Empty,
            BookId = l.BookId,
            BookTitle = l.Book?.Title ?? string.Empty,
            BookAuthor = l.Book?.Author ?? string.Empty,
            CoverImage = l.Book?.CoverImage,
            Condition = l.Condition,
            ExchangeType = l.ExchangeType,
            Status = l.Status,
            ListedAt = l.ListedAt,
            ExpiresAt = l.ExpiresAt
        };
    }
}
