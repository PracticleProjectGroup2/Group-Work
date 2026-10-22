namespace JINF.Api.Models;

public class Photo
{
    public int Id { get; set; }

    public int ItemReportId { get; set; }

    public ItemReport ItemReport { get; set; } = null!;

    public string StorageKey { get; set; } = string.Empty;

    public string ContentType { get; set; } = string.Empty;

    public long SizeBytes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? DeleteAfter { get; set; }

    public DateTime? DeletedAt { get; set; }
}