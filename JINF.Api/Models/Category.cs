namespace JINF.Api.Models;

public class Category
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public bool IsSensitive { get; set; }

    public bool IsActive { get; set; } = true;
}