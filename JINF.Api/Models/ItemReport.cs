namespace JINF.Api.Models;

public class ItemReport
{
    public int Id { get; set; }

    public string ReporterId { get; set; } = string.Empty;

    public ReportType ReportType { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public int CategoryId { get; set; }

    public Category Category { get; set; } = null!;

    public int LocationId { get; set; }

    public Location Location { get; set; } = null!;

    public DateOnly EventDate { get; set; }

    public ItemStatus Status { get; set; } = ItemStatus.Open;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }
}