using BookMate.API.DTOs;

namespace BookMate.API.Services
{
    public interface IExchangeService
    {
        Task<ExchangeResponseDto> RequestExchangeAsync(Guid requesterId, RequestExchangeDto dto);
        Task<ExchangeResponseDto?> GetByIdAsync(Guid id);
        Task<List<ExchangeResponseDto>> GetByUserIdAsync(Guid userId);
        Task<ExchangeResponseDto> AcceptAsync(Guid exchangeId, Guid ownerId);
        Task<ExchangeResponseDto> RejectAsync(Guid exchangeId, Guid ownerId, RejectExchangeDto dto);
        Task<ExchangeResponseDto> SetPickupAsync(Guid exchangeId, Guid ownerId, SetPickupDto dto);
        Task<ExchangeResponseDto> CompleteAsync(Guid exchangeId, Guid ownerId);
        Task<ExchangeResponseDto> ConfirmHandoverByOwnerAsync(Guid exchangeId, Guid ownerId);
        Task<ExchangeResponseDto> ConfirmHandoverByRequesterAsync(Guid exchangeId, Guid requesterId);
        Task<ExchangeResponseDto> ConfirmReturnByRequesterAsync(Guid exchangeId, Guid requesterId, string returnLocation);
        Task<ExchangeResponseDto> ConfirmReturnByOwnerAsync(Guid exchangeId, Guid ownerId);
    }
}
