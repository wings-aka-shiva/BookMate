using BookMate.API.DTOs;
using BookMate.API.Repositories;

namespace BookMate.API.Services
{
    public class UserService
    {
        private readonly UserRepository _userRepo;

        public UserService(UserRepository userRepo)
        {
            _userRepo = userRepo;
        }

        public async Task<UserDto?> GetProfileAsync(Guid id)
        {
            var user = await _userRepo.GetByIdAsync(id);
            if (user == null) return null;

            return new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Phone = user.Phone,
                DisplayName = user.DisplayName,
                ReputationScore = user.ReputationScore,
                VisaStatus = user.VisaStatus,
                CreatedAt = user.CreatedAt
            };
        }

        public async Task<UserStatsDto?> GetStatsAsync(Guid id)
        {
            var user = await _userRepo.GetByIdAsync(id);
            if (user == null) return null;

            return new UserStatsDto
            {
                BooksListed = 0,
                BooksSwapped = 0,
                BooksLent = 0,
                BooksDonated = 0,
                ReturnsOnTime = 0,
                Defaults = 0,
                BadgesEarned = 0,
                ReputationScore = user.ReputationScore
            };
        }

        public async Task<bool> UpdateProfileAsync(Guid id, UpdateUserDto dto)
        {
            var user = await _userRepo.GetByIdAsync(id);
            if (user == null) return false;

            if (dto.DisplayName != null) user.DisplayName = dto.DisplayName;
            if (dto.Phone != null) user.Phone = dto.Phone;
            if (dto.VisaStatus != null) user.VisaStatus = dto.VisaStatus;

            return await _userRepo.UpdateAsync(user);
        }

        public async Task<bool> ArchiveAccountAsync(Guid id)
        {
            return await _userRepo.ArchiveAsync(id);
        }

        public async Task<bool> DeleteAccountAsync(Guid id)
        {
            return await _userRepo.DeleteAsync(id);
        }
    }
}
