
using System.IdentityModel.Tokens.Jwt;
using SecurityClaim = System.Security.Claims.Claim;
using SecurityClaimTypes = System.Security.Claims.ClaimTypes;
using System.Text;
using JINF.Api.Database;
using JINF.Api.DTO.Auth;
using JINF.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace JINF.Api.Services;

public class AuthService : IAuthService
{
    private const string DefaultRole = "User";
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly IConfiguration _configuration;
    private readonly ApplicationDbContext _db;

    public AuthService(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        RoleManager<IdentityRole> roleManager,
        IConfiguration configuration,
        ApplicationDbContext db)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _roleManager = roleManager;
        _configuration = configuration;
        _db = db;
    }

    public async Task RegisterAsync(
        RegisterRequest request,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var email = request.Email.Trim();

        var existingUser = await _userManager.FindByEmailAsync(email);

        if (existingUser is not null)
            throw new InvalidOperationException(
                "An account with this email already exists.");

        if (!await _roleManager.RoleExistsAsync(DefaultRole))
        {
            var roleResult = await _roleManager.CreateAsync(
                new IdentityRole(DefaultRole));

            if (!roleResult.Succeeded)
                throw new InvalidOperationException(
                    "Unable to initialise the user role.");
        }

        var user = new ApplicationUser
        {
            UserName = email,
            Email = email,
            FullName = request.FullName.Trim(),
            EmailConfirmed = false
        };

        var result = await _userManager.CreateAsync(
            user, request.Password);

        if (!result.Succeeded)
        {
            var errors = string.Join("; ",
                result.Errors.Select(e => e.Description));

            throw new InvalidOperationException(errors);
        }

        var addRoleResult = await _userManager.AddToRoleAsync(
            user, DefaultRole);

        if (!addRoleResult.Succeeded)
        {
            // Avoid leaving an account without its required role.
            await _userManager.DeleteAsync(user);

            throw new InvalidOperationException(
                "Unable to assign the user role.");
        }
    }

    public async Task<LoginResponse> LoginAsync(
        LoginRequest request,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var user = await _userManager.FindByEmailAsync(
            request.Email.Trim());

        if (user is null)
            throw new UnauthorizedAccessException(
                "Invalid email or password.");

        var signInResult = await _signInManager
            .CheckPasswordSignInAsync(
                user, request.Password, lockoutOnFailure: true);

        if (signInResult.IsLockedOut)
            throw new UnauthorizedAccessException(
                "The account is temporarily locked. Try again later.");

        if (!signInResult.Succeeded)
            throw new UnauthorizedAccessException(
                "Invalid email or password.");

        var roles = await _userManager.GetRolesAsync(user);

        var claims = new List<SecurityClaim>
        {
        new(JwtRegisteredClaimNames.Sub, user.Id),
        new(SecurityClaimTypes.NameIdentifier, user.Id),
        new(JwtRegisteredClaimNames.Email, user.Email ?? ""),
        new(SecurityClaimTypes.Name, user.FullName)
        };

        claims.AddRange(roles.Select(role =>
            new SecurityClaim(SecurityClaimTypes.Role, role)));
        var keyText = _configuration["Jwt:Key"]
            ?? throw new InvalidOperationException(
                "JWT key is missing.");

        var issuer = _configuration["Jwt:Issuer"]
            ?? throw new InvalidOperationException(
                "JWT issuer is missing.");

        var audience = _configuration["Jwt:Audience"]
            ?? throw new InvalidOperationException(
                "JWT audience is missing.");

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(keyText));

        var credentials = new SigningCredentials(
            key, SecurityAlgorithms.HmacSha256);

        var expires = DateTime.UtcNow.AddMinutes(30);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: expires,
            signingCredentials: credentials);

        return new LoginResponse
        {
            AccessToken = new JwtSecurityTokenHandler()
                .WriteToken(token),
            TokenType = "Bearer",
            ExpiresIn = 1800
        };
    }

    public async Task<UserResponse?> GetCurrentUserAsync(
        string userId,
        CancellationToken cancellationToken = default)
    {
        var user = await _userManager.Users
            .FirstOrDefaultAsync(
                u => u.Id == userId, cancellationToken);

        if (user is null)
            return null;

        var roles = await _userManager.GetRolesAsync(user);

        return new UserResponse
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email ?? "",
            Role = roles.FirstOrDefault() ?? DefaultRole
        };
    }
}

