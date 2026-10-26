using System.ComponentModel.DataAnnotations;

namespace JINF.Api.DTO.Auth;

public class RegisterRequest
{
    [Required]
    [StringLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [StringLength(254)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [StringLength(128, MinimumLength = 15)]
    public string Password { get; set; } = string.Empty;
}