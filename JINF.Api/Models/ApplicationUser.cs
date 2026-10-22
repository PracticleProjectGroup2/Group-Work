using Microsoft.AspNetCore.Identity;

namespace JINF.Api.Models;

public class ApplicationUser : IdentityUser
{
    public string FullName { get; set; } = string.Empty;
}