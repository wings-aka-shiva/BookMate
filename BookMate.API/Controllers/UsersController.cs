using BookMate.API.DTOs;
using BookMate.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookMate.API.Controllers
{
    [ApiController]
    [Route("api/users")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly UserService _userService;

        public UsersController(UserService userService)
        {
            _userService = userService;
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetProfile(Guid id)
        {
            var user = await _userService.GetProfileAsync(id);
            if (user == null) return NotFound();
            return Ok(user);
        }

        [HttpPatch("{id:guid}")]
        public async Task<IActionResult> UpdateProfile(Guid id, [FromBody] UpdateUserDto dto)
        {
            var success = await _userService.UpdateProfileAsync(id, dto);
            if (!success) return NotFound();
            return NoContent();
        }

        [HttpGet("{id:guid}/stats")]
        public async Task<IActionResult> GetStats(Guid id)
        {
            var stats = await _userService.GetStatsAsync(id);
            if (stats == null) return NotFound();
            return Ok(stats);
        }

        [HttpGet("{id:guid}/badges")]
        public IActionResult GetBadges(Guid id) => Ok(new List<object>());

        [HttpGet("{id:guid}/listings")]
        public IActionResult GetListings(Guid id) => Ok(new List<object>());

        [HttpGet("{id:guid}/exchanges")]
        public IActionResult GetExchanges(Guid id) => Ok(new List<object>());

        [HttpPatch("{id:guid}/archive")]
        public async Task<IActionResult> ArchiveAccount(Guid id)
        {
            var success = await _userService.ArchiveAccountAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteAccount(Guid id)
        {
            var success = await _userService.DeleteAccountAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}
