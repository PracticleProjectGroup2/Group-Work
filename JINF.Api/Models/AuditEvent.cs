namespace JINF.Api.Models;

public class AuditEvent
{
    public int Id { get; set; }

    public string? ActorId { get; set; }

    public ApplicationUser? Actor { get; set; }

    public string Action { get; set; } = string.Empty;

    public string EntityType { get; set; } = string.Empty;

    public int EntityId { get; set; }

    public DateTime OccurredAt { get; set; } = DateTime.UtcNow;

    public string? Reason { get; set; }
}