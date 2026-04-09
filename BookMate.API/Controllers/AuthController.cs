using BookMate.API.DTOs;
using BookMate.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace BookMate.API.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;

        public AuthController(AuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            var result = await _authService.Register(dto);
            if (result == null)
                return BadRequest("Email already in use.");
            return Ok(result);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var result = await _authService.Login(dto);
            if (result == null)
                return Unauthorized("Invalid email or password.");
            return Ok(result);
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            // JWT is stateless — client just discards the token
            return Ok("Logged out successfully.");
        }
    }
}