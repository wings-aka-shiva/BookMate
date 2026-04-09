using BookMate.API.DTOs;
using BookMate.API.Models;
using BookMate.API.Repositories;

namespace BookMate.API.Services
{
    public class BookService
    {
        private readonly BookRepository _bookRepo;

        public BookService(BookRepository bookRepo)
        {
            _bookRepo = bookRepo;
        }

        public async Task<List<BookDto>> GetAllAsync()
        {
            var books = await _bookRepo.GetAllAsync();
            return books.Select(MapToDto).ToList();
        }

        public async Task<BookDto?> GetByIdAsync(Guid id)
        {
            var book = await _bookRepo.GetByIdAsync(id);
            if (book == null) return null;
            return MapToDto(book);
        }

        public async Task<BookDto> CreateAsync(CreateBookDto dto)
        {
            var existing = await _bookRepo.GetByIsbnAsync(dto.Isbn);
            if (existing != null) return MapToDto(existing);

            var book = new Book
            {
                Id = Guid.NewGuid(),
                Title = dto.Title,
                Author = dto.Author,
                Isbn = dto.Isbn,
                Genre = dto.Genre,
                PublishedYear = dto.PublishedYear,
                CoverImage = dto.CoverImage
            };

            var created = await _bookRepo.CreateAsync(book);
            return MapToDto(created);
        }

        private static BookDto MapToDto(Book book) => new BookDto
        {
            Id = book.Id,
            Title = book.Title,
            Author = book.Author,
            Isbn = book.Isbn,
            Genre = book.Genre,
            PublishedYear = book.PublishedYear,
            CoverImage = book.CoverImage
        };
    }
}
