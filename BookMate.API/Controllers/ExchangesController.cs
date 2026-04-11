using BookMate.API.DTOs;
using BookMate.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BookMate.API.Controllers
{
    [ApiController]
    [Authorize]
    public class ExchangesController : ControllerBase
    {
        private readonly IExchangeService _exchangeService;

        public ExchangesController(IExchangeService exchangeService)
        {
            _exchangeService = exchangeService;
        }

        [HttpPost("api/exchanges")]
        public async Task<IActionResult> RequestExchange([FromBody] RequestExchangeDto dto)
        {
            try
            {
                var requesterId = GetUserId();
                if (requesterId == null) return Unauthorized();

                var exchange = await _exchangeService.RequestExchangeAsync(requesterId.Value, dto);
                return CreatedAtAction(nameof(GetById), new { id = exchange.Id }, exchange);
            }
            catch (InvalidOperationException ex) { return BadRequest(ex.Message); }
            catch (Exception) { return StatusCode(500); }
        }

        [HttpGet("api/exchanges/{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var exchange = await _exchangeService.GetByIdAsync(id);
                if (exchange == null) return NotFound();
                return Ok(exchange);
            }
            catch (InvalidOperationException ex) { return BadRequest(ex.Message); }
            catch (Exception) { return StatusCode(500); }
        }

[HttpPatch("api/exchanges/{id:guid}/accept")]
        public async Task<IActionResult> Accept(Guid id)
        {
            try
            {
                var ownerId = GetUserId();
                if (ownerId == null) return Unauthorized();

                var exchange = await _exchangeService.AcceptAsync(id, ownerId.Value);
                return Ok(exchange);
            }
            catch (InvalidOperationException ex) { return BadRequest(ex.Message); }
            catch (Exception) { return StatusCode(500); }
        }

        [HttpPatch("api/exchanges/{id:guid}/reject")]
        public async Task<IActionResult> Reject(Guid id, [FromBody] RejectExchangeDto dto)
        {
            try
            {
                var ownerId = GetUserId();
                if (ownerId == null) return Unauthorized();

                var exchange = await _exchangeService.RejectAsync(id, ownerId.Value, dto);
                return Ok(exchange);
            }
            catch (InvalidOperationException ex) { return BadRequest(ex.Message); }
            catch (Exception) { return StatusCode(500); }
        }

        [HttpPatch("api/exchanges/{id:guid}/pickup")]
        public async Task<IActionResult> SetPickup(Guid id, [FromBody] SetPickupDto dto)
        {
            try
            {
                var ownerId = GetUserId();
                if (ownerId == null) return Unauthorized();

                var exchange = await _exchangeService.SetPickupAsync(id, ownerId.Value, dto);
                return Ok(exchange);
            }
            catch (InvalidOperationException ex) { return BadRequest(ex.Message); }
            catch (Exception) { return StatusCode(500); }
        }

        [HttpPatch("api/exchanges/{id:guid}/complete")]
        public async Task<IActionResult> Complete(Guid id)
        {
            try
            {
                var ownerId = GetUserId();
                if (ownerId == null) return Unauthorized();

                var exchange = await _exchangeService.CompleteAsync(id, ownerId.Value);
                return Ok(exchange);
            }
            catch (InvalidOperationException ex) { return BadRequest(ex.Message); }
            catch (Exception) { return StatusCode(500); }
        }

        [HttpPatch("api/exchanges/{id:guid}/return")]
        public async Task<IActionResult> Return(Guid id)
        {
            try
            {
                var requesterId = GetUserId();
                if (requesterId == null) return Unauthorized();

                var exchange = await _exchangeService.ReturnAsync(id, requesterId.Value);
                return Ok(exchange);
            }
            catch (InvalidOperationException ex) { return BadRequest(ex.Message); }
            catch (Exception) { return StatusCode(500); }
        }

        private Guid? GetUserId()
        {
            var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(claim, out var id) ? id : null;
        }
    }
}
