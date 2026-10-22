namespace JINF.Api.Models;

public class Claim
{
    public int Id { get; set; }

    public int ItemReportId { get; set; }

    public ItemReport ItemReport { get; set; } = null!;

    public string ClaimantId { get; set; } = string.Empty;

    public ApplicationUser Claimant { get; set; } = null!;

    public string ProofOfOwnership { get; set; } = string.Empty;

    public ClaimStatus Status { get; set; } = ClaimStatus.Pending;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public string? DecisionReason { get; set; }

    public string? ReviewedById { get; set; }

    public ApplicationUser? ReviewedBy { get; set; }

    public DateTime? ReviewedAt { get; set; }
}