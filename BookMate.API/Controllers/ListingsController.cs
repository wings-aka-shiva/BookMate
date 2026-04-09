using BookMate.API.DTOs;
using BookMate.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BookMate.API.Controllers
{
    [ApiController]
    [Route("api/listings")]
    [Authorize]
    public class ListingsController : ControllerBase
    {
        private readonly ListingService _listingService;

        public ListingsController(ListingService listingService)
        {
            _listingService = listingService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? search)
        {
            var listings = string.IsNullOrWhiteSpace(search)
                ? await _listingService.GetAllAsync()
                : await _listingService.SearchAsync(search);

            return Ok(listings);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var listing = await _listingService.GetByIdAsync(id);
            if (listing == null) return NotFound();
            return Ok(listing);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateListingDto dto)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
                return Unauthorized();

            var listing = await _listingService.CreateAsync(userId, dto);
            return CreatedAtAction(nameof(GetById), new { id = listing.Id }, listing);
        }

        [HttpPatch("{id:guid}/status")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateListingStatusDto dto)
        {
            var listing = await _listingService.UpdateStatusAsync(id, dto.Status);
            if (listing == null) return NotFound();
            return Ok(listing);
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var success = await _listingService.DeleteAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}
