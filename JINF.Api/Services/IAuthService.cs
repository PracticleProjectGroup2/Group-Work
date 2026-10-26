using JINF.Api.DTO.Auth;

namespace JINF.Api.Services;

public interface IAuthService
{
    Task RegisterAsync(
        RegisterRequest request,
        CancellationToken cancellationToken = default);

    Task<LoginResponse> LoginAsync(
        LoginRequest request,
        CancellationToken cancellationToken = default);

    Task<UserResponse?> GetCurrentUserAsync(
        string userId,
        CancellationToken cancellationToken = default);
}