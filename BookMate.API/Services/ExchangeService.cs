using BookMate.API.Data;
using BookMate.API.DTOs;
using BookMate.API.Models;
using BookMate.API.Repositories;
using Microsoft.EntityFrameworkCore;

namespace BookMate.API.Services
{
    public class ExchangeService : IExchangeService
    {
        private readonly IExchangeRepository _exchangeRepo;
        private readonly AppDbContext _db;

        public ExchangeService(IExchangeRepository exchangeRepo, AppDbContext db)
        {
            _exchangeRepo = exchangeRepo;
            _db = db;
        }

        public async Task<ExchangeResponseDto> RequestExchangeAsync(Guid requesterId, RequestExchangeDto dto)
        {
            var listing = await _db.Listings
                .Include(l => l.Book)
                .FirstOrDefaultAsync(l => l.Id == dto.ListingId)
                ?? throw new InvalidOperationException("Listing not found.");

            Exchange exchange;

            if (dto.Type == "Swap")
            {
                exchange = new Exchange
                {
                    Id          = Guid.NewGuid(),
                    ListingId   = listing.Id,
                    RequesterId = requesterId,
                    OwnerId     = listing.UserId,
                    Type        = dto.Type,
                    Status      = "Pending"
                };
                await _exchangeRepo.CreateAsync(exchange);
            }
            else
            {
                // Temporary or PassItOn — queue logic
                var activeCount = await _exchangeRepo.GetActiveQueueCountAsync(requesterId);
                if (activeCount >= 2)
                    throw new InvalidOperationException(
                        "You are already waiting for 2 books. Please remove one to join this queue.");

                var existing = await _exchangeRepo.GetQueueEntryAsync(listing.Id, requesterId);
                if (existing != null)
                    throw new InvalidOperationException("You are already in the queue for this listing.");

                var queueEntry = new ExchangeQueue
                {
                    Id          = Guid.NewGuid(),
                    ListingId   = listing.Id,
                    RequesterId = requesterId,
                    Status      = "Waiting"
                };

                // Check if queue is empty — if so, make this entry Active immediately
                var next = await _exchangeRepo.GetNextInQueueAsync(listing.Id);
                if (next == null)
                {
                    queueEntry.Status = "Active";
                    await _exchangeRepo.AddToQueueAsync(queueEntry);

                    exchange = new Exchange
                    {
                        Id          = Guid.NewGuid(),
                        ListingId   = listing.Id,
                        RequesterId = requesterId,
                        OwnerId     = listing.UserId,
                        Type        = dto.Type,
                        Status      = "Pending"
                    };
                    await _exchangeRepo.CreateAsync(exchange);
                }
                else
                {
                    await _exchangeRepo.AddToQueueAsync(queueEntry);

                    // Return a placeholder exchange for the queued state
                    exchange = new Exchange
                    {
                        Id          = Guid.NewGuid(),
                        ListingId   = listing.Id,
                        RequesterId = requesterId,
                        OwnerId     = listing.UserId,
                        Type        = dto.Type,
                        Status      = "Pending"
                    };
                    await _exchangeRepo.CreateAsync(exchange);
                }
            }

            var full = await _exchangeRepo.GetByIdAsync(exchange.Id)
                ?? throw new InvalidOperationException("Failed to reload exchange.");

            return MapToDto(full);
        }

        public async Task<ExchangeResponseDto?> GetByIdAsync(Guid id)
        {
            var exchange = await _exchangeRepo.GetByIdAsync(id);
            return exchange == null ? null : MapToDto(exchange);
        }

        public async Task<List<ExchangeResponseDto>> GetByUserIdAsync(Guid userId)
        {
            var exchanges = await _exchangeRepo.GetByUserIdAsync(userId);
            return exchanges.Select(MapToDto).ToList();
        }

        public async Task<ExchangeResponseDto> AcceptAsync(Guid exchangeId, Guid ownerId)
        {
            var exchange = await _exchangeRepo.GetByIdAsync(exchangeId)
                ?? throw new InvalidOperationException("Exchange not found.");

            if (exchange.OwnerId != ownerId)
                throw new InvalidOperationException("Only the listing owner can accept this exchange.");

            if (exchange.Status != "Pending")
                throw new InvalidOperationException("Only Pending exchanges can be accepted.");

            exchange.Status = "Accepted";

            if (exchange.Type == "Temporary")
                exchange.DueDate = DateTime.UtcNow.AddDays(28);

            // Mark listing as Taken
            var listing = await _db.Listings.FindAsync(exchange.ListingId);
            if (listing != null)
                listing.Status = "Taken";

            // +10 reputation to Owner for completing a Swap
            if (exchange.Type == "Swap")
            {
                var owner = await _db.Users.FindAsync(ownerId);
                if (owner != null)
                    owner.ReputationScore += 10;
            }

            await _db.SaveChangesAsync();
            await _exchangeRepo.UpdateAsync(exchange);

            var full = await _exchangeRepo.GetByIdAsync(exchangeId)!
                ?? throw new InvalidOperationException("Failed to reload exchange.");

            return MapToDto(full);
        }

        public async Task<ExchangeResponseDto> RejectAsync(Guid exchangeId, Guid ownerId, RejectExchangeDto dto)
        {
            var exchange = await _exchangeRepo.GetByIdAsync(exchangeId)
                ?? throw new InvalidOperationException("Exchange not found.");

            if (exchange.OwnerId != ownerId)
                throw new InvalidOperationException("Only the listing owner can reject this exchange.");

            if (exchange.Status != "Pending")
                throw new InvalidOperationException("Only Pending exchanges can be rejected.");

            exchange.Status = "Rejected";
            exchange.RejectionReason = dto.RejectionReason;
            await _exchangeRepo.UpdateAsync(exchange);

            // For queued types, advance the queue
            if (exchange.Type == "Temporary" || exchange.Type == "PassItOn")
            {
                var next = await _exchangeRepo.GetNextInQueueAsync(exchange.ListingId);
                if (next != null)
                {
                    next.Status = "Active";
                    await _exchangeRepo.UpdateQueueEntryAsync(next);

                    var newExchange = new Exchange
                    {
                        Id          = Guid.NewGuid(),
                        ListingId   = exchange.ListingId,
                        RequesterId = next.RequesterId,
                        OwnerId     = ownerId,
                        Type        = exchange.Type,
                        Status      = "Pending"
                    };
                    await _exchangeRepo.CreateAsync(newExchange);
                }
            }

            var full = await _exchangeRepo.GetByIdAsync(exchangeId)
                ?? throw new InvalidOperationException("Failed to reload exchange.");

            return MapToDto(full);
        }

        public async Task<ExchangeResponseDto> SetPickupAsync(Guid exchangeId, Guid ownerId, SetPickupDto dto)
        {
            var exchange = await _exchangeRepo.GetByIdAsync(exchangeId)
                ?? throw new InvalidOperationException("Exchange not found.");

            if (exchange.OwnerId != ownerId)
                throw new InvalidOperationException("Only the listing owner can set a pickup location.");

            exchange.PickupLocation = dto.PickupLocation;
            await _exchangeRepo.UpdateAsync(exchange);

            var full = await _exchangeRepo.GetByIdAsync(exchangeId)
                ?? throw new InvalidOperationException("Failed to reload exchange.");

            return MapToDto(full);
        }

        public async Task<ExchangeResponseDto> CompleteAsync(Guid exchangeId, Guid ownerId)
        {
            var exchange = await _exchangeRepo.GetByIdAsync(exchangeId)
                ?? throw new InvalidOperationException("Exchange not found.");

            if (exchange.OwnerId != ownerId)
                throw new InvalidOperationException("Only the listing owner can complete this exchange.");

            if (exchange.Status != "Accepted")
                throw new InvalidOperationException("Only Accepted exchanges can be completed.");

            exchange.Status      = "Completed";
            exchange.CompletedAt = DateTime.UtcNow;

            // +10 reputation to both parties for a Swap
            if (exchange.Type == "Swap")
            {
                var requester = await _db.Users.FindAsync(exchange.RequesterId);
                var owner     = await _db.Users.FindAsync(exchange.OwnerId);
                if (requester != null) requester.ReputationScore += 10;
                if (owner != null)     owner.ReputationScore     += 10;
                await _db.SaveChangesAsync();
            }

            await _exchangeRepo.UpdateAsync(exchange);

            var full = await _exchangeRepo.GetByIdAsync(exchangeId)
                ?? throw new InvalidOperationException("Failed to reload exchange.");

            return MapToDto(full);
        }

        public async Task<ExchangeResponseDto> ReturnAsync(Guid exchangeId, Guid requesterId)
        {
            var exchange = await _exchangeRepo.GetByIdAsync(exchangeId)
                ?? throw new InvalidOperationException("Exchange not found.");

            if (exchange.RequesterId != requesterId)
                throw new InvalidOperationException("Only the requester can mark a book as returned.");

            if (exchange.Status != "Accepted")
                throw new InvalidOperationException("Only Accepted exchanges can be returned.");

            if (exchange.Type != "Temporary")
                throw new InvalidOperationException("Only Temporary exchanges can be returned.");

            exchange.Status      = "Returned";
            exchange.CompletedAt = DateTime.UtcNow;

            // +15 reputation to Requester for returning on time
            var requester = await _db.Users.FindAsync(requesterId);
            if (requester != null)
            {
                requester.ReputationScore += 15;
                await _db.SaveChangesAsync();
            }

            await _exchangeRepo.UpdateAsync(exchange);

            var full = await _exchangeRepo.GetByIdAsync(exchangeId)
                ?? throw new InvalidOperationException("Failed to reload exchange.");

            return MapToDto(full);
        }

        private static ExchangeResponseDto MapToDto(Exchange e) => new ExchangeResponseDto
        {
            Id                 = e.Id,
            ListingId          = e.ListingId,
            BookTitle          = e.Listing?.Book?.Title ?? string.Empty,
            RequesterId        = e.RequesterId,
            RequesterName      = e.Requester?.DisplayName ?? string.Empty,
            OwnerId            = e.OwnerId,
            OwnerName          = e.Owner?.DisplayName ?? string.Empty,
            Type               = e.Type,
            Status             = e.Status,
            PickupLocation     = e.PickupLocation,
            DueDate            = e.DueDate,
            ExtensionRequested = e.ExtensionRequested,
            ExtendedDueDate    = e.ExtendedDueDate,
            RejectionReason    = e.RejectionReason,
            CreatedAt          = e.CreatedAt,
            CompletedAt        = e.CompletedAt
        };
    }
}
