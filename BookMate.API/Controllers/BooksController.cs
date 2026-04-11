using BookMate.API.DTOs;
using BookMate.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookMate.API.Controllers
{
    [ApiController]
    [Route("api/books")]
    [Authorize]
    public class BooksController : ControllerBase
    {
        private readonly BookService _bookService;
        private readonly ListingService _listingService;

        public BooksController(BookService bookService, ListingService listingService)
        {
            _bookService = bookService;
            _listingService = listingService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? search)
        {
            var books = string.IsNullOrWhiteSpace(search)
                ? await _bookService.GetAllAsync()
                : await _bookService.SearchAsync(search);
            return Ok(books);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateBookDto dto)
        {
            var book = await _bookService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = book.Id }, book);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var book = await _bookService.GetByIdAsync(id);
            if (book == null) return NotFound();
            return Ok(book);
        }

        [HttpGet("{id:guid}/listings")]
        public async Task<IActionResult> GetListings(Guid id)
        {
            var listings = await _listingService.GetByBookIdAsync(id);
            return Ok(listings);
        }

        [HttpGet("{id:guid}/groups")]
        public IActionResult GetGroups(Guid id) => Ok(new List<object>());
    }
}
