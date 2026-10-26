using ClaimModel = JINF.Api.Models.Claim;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using JINF.Api.Database;
using JINF.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JINF.Api.Controllers;

[ApiController]
[Route("api/claims")]
public class ClaimsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public ClaimsController(ApplicationDbContext db)
    {
        _db = db;
    }

    // POST: api/claims
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateClaim(
        [FromBody] CreateClaimRequest request,
        CancellationToken cancellationToken)
    {
        var claimantId = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(claimantId))
        {
            return Unauthorized();
        }

        var itemExists = await _db.ItemReports
            .AnyAsync(
                item => item.Id == request.ItemReportId,
                cancellationToken);

        if (!itemExists)
        {
            return NotFound(new
            {
                message = "The item report was not found."
            });
        }


        var proof = request.ProofOfOwnership.Trim();

        if (string.IsNullOrWhiteSpace(proof))
        {
            return BadRequest(new
            {
                message = "Proof of ownership is required."
            });
        }

        var alreadyClaimed = await _db.Claims
            .AnyAsync(
                claim =>
                    claim.ItemReportId == request.ItemReportId &&
                    claim.ClaimantId == claimantId,
                cancellationToken);

        if (alreadyClaimed)
        {
            return Conflict(new
            {
                message = "You have already submitted a claim for this item."
            });
        }

        var claim = new ClaimModel
        {
            ItemReportId = request.ItemReportId,
            ClaimantId = claimantId,
            ProofOfOwnership = proof,
            Status = ClaimStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        _db.Claims.Add(claim);



        try
        {
            await _db.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException)
        {
            // A database constraint may reject a duplicate claim.
            return Conflict(new
            {
                message = "The claim could not be saved. Check whether you have already claimed this item."
            });
        }

        return StatusCode(StatusCodes.Status201Created, new
        {
            claim.Id,
            claim.ItemReportId,
            claim.ClaimantId,
            claim.ProofOfOwnership,
            Status = claim.Status.ToString(),
            claim.CreatedAt

        });
    }

    // GET: api/claims/my
    [HttpGet("my")]
    [Authorize]
    public async Task<IActionResult> GetMyClaims(
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var claims = await _db.Claims
            .Where(claim => claim.ClaimantId == userId)
            .OrderByDescending(claim => claim.CreatedAt)
            .Select(claim => new
            {
                claim.Id,
                claim.ItemReportId,
                ItemTitle = claim.ItemReport.Title,
                claim.ProofOfOwnership,
                Status = claim.Status.ToString(),
                claim.CreatedAt,
                claim.DecisionReason,
                claim.ReviewedAt
            })
            .ToListAsync(cancellationToken);

        return Ok(claims);
    }

    // GET: api/claims
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllClaims(
        CancellationToken cancellationToken)
    {
        var claims = await _db.Claims
            .OrderByDescending(claim => claim.CreatedAt)
            .Select(claim => new
            {
                claim.Id,
                claim.ItemReportId,
                ItemTitle = claim.ItemReport.Title,
                claim.ClaimantId,
                ClaimantName = claim.Claimant.FullName,
                claim.ProofOfOwnership,
                Status = claim.Status.ToString(),
                claim.CreatedAt,
                claim.DecisionReason,
                claim.ReviewedById,
                claim.ReviewedAt
            })
            .ToListAsync(cancellationToken);

        return Ok(claims);
    }

    // PUT: api/claims/{id}/decision
    [HttpPut("{id:int}/decision")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DecideClaim(
        int id,
        [FromBody] ClaimDecisionRequest request,
        CancellationToken cancellationToken)
    {
        if (request.Status != ClaimStatus.Approved &&
            request.Status != ClaimStatus.Rejected)
        {
            return BadRequest(new
            {
                message = "A claim can only be approved or rejected."
            });
        }

        var reason = request.DecisionReason?.Trim();

        if (request.Status == ClaimStatus.Rejected &&
            string.IsNullOrWhiteSpace(reason))
        {
            return BadRequest(new
            {
                message = "A reason is required when rejecting a claim."
            });
        }

        if (reason?.Length > 500)
        {
            return BadRequest(new
            {
                message = "The decision reason cannot exceed 500 characters."
            });
        }

        var reviewerId = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(reviewerId))
        {
            return Unauthorized();
        }

        await using var transaction =
            await _db.Database.BeginTransactionAsync(cancellationToken);

        var claim = await _db.Claims
            .FirstOrDefaultAsync(
                c => c.Id == id,
                cancellationToken);

        if (claim is null)
        {
            return NotFound(new
            {
                message = "The claim was not found."
            });
        }

        if (claim.Status != ClaimStatus.Pending)
        {
            return Conflict(new
            {
                message = "Only pending claims can be reviewed."
            });
        }

        claim.Status = request.Status;
        claim.DecisionReason = string.IsNullOrWhiteSpace(reason)
            ? null
            : reason;
        claim.ReviewedById = reviewerId;
        claim.ReviewedAt = DateTime.UtcNow;


        var auditEvent = new AuditEvent
        {
            ActorId = reviewerId,
            Action = request.Status == ClaimStatus.Approved
                ? "ClaimApproved"
                : "ClaimRejected",
            EntityType = "Claim",
            EntityId = claim.Id,
            OccurredAt = DateTime.UtcNow,
            Reason = reason
        };

        _db.AuditEvents.Add(auditEvent);


        try
        {
            await _db.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
        }
        catch (DbUpdateException)
        {
            await transaction.RollbackAsync(cancellationToken);

            return Conflict(new
            {
                message = "The decision could not be saved. Another claim may already be approved for this item."
            });
        }

        return Ok(new
        {
            claim.Id,
            Status = claim.Status.ToString(),
            claim.DecisionReason,
            claim.ReviewedById,
            claim.ReviewedAt
        });
    }
}


public class CreateClaimRequest
{
    [Range(1, int.MaxValue)]
    public int ItemReportId { get; set; }

    [Required]
    [StringLength(2000, MinimumLength = 1)]
    public string ProofOfOwnership { get; set; } = string.Empty;
}

public class ClaimDecisionRequest
{
    [Required]
    public ClaimStatus Status { get; set; }

    [StringLength(500)]
    public string? DecisionReason { get; set; }
}

