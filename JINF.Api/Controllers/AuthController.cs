
using System.Security.Claims;
using JINF.Api.DTO.Auth;
using JINF.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JINF.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register(
        [FromBody] RegisterRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            await _authService.RegisterAsync(
                request, cancellationToken);

            return Ok(new MessageResponse
            {
                Message = "Account registered successfully."
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new MessageResponse
            {
                Message = ex.Message
            });
        }
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login(
        [FromBody] LoginRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var response = await _authService.LoginAsync(
                request, cancellationToken);

            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new MessageResponse
            {
                Message = ex.Message
            });
        }
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me(
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var user = await _authService.GetCurrentUserAsync(
            userId, cancellationToken);

        if (user is null)
            return NotFound(new MessageResponse
            {
                Message = "User account not found."
            });

        return Ok(user);
    }
}
