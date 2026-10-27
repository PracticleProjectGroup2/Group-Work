namespace JINF.Api.DTO.Auth;

public class UserResponse
{
    public string Id { get; set; } = string.Empty;

    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Role { get; set; } = "User";

    public List<string> Roles { get; set; } = new();
}