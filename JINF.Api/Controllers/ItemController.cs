
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using JINF.Api.Database;
using JINF.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JINF.Api.Controllers;

[ApiController]
[Route("api/items")]
public class ItemController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public ItemController(ApplicationDbContext db)
    {
        _db = db;
    }

    // GET: api/items
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetItems(
        [FromQuery] string? q,
        [FromQuery] string? type,
        [FromQuery] int? categoryId,
        [FromQuery] int? locationId,
        CancellationToken cancellationToken)
    {
        var query = _db.ItemReports
            .AsNoTracking()
            .Where(item => item.Status != ItemStatus.Archived);

        // Filter by Lost or Found.
        if (!string.IsNullOrWhiteSpace(type))
        {
            if (!Enum.TryParse<ReportType>(
                    type, true, out var reportType) ||
                !Enum.IsDefined(typeof(ReportType), reportType))
            {
                return BadRequest(new
                {
                    message = "Invalid report type."
                });
            }

            query = query.Where(
                item => item.ReportType == reportType);
        }

        // Search the item title and description.
        if (!string.IsNullOrWhiteSpace(q))
        {
            var search = q.Trim().ToLower();

            query = query.Where(item =>
                item.Title.ToLower().Contains(search) ||
                item.Description.ToLower().Contains(search));
        }

        // Filter by category.
        if (categoryId.HasValue)
        {
            query = query.Where(
                item => item.CategoryId == categoryId.Value);
        }

        // Filter by location.
        if (locationId.HasValue)
        {
            query = query.Where(
                item => item.LocationId == locationId.Value);
        }

        var items = await query
            .OrderByDescending(item => item.CreatedAt)
            .Select(item => new
            {
                item.Id,
                item.ReportType,
                item.Title,
                item.Description,
                item.CategoryId,
                CategoryName = item.Category.Name,
                item.LocationId,
                LocationName = item.Location.Name,
                item.EventDate,
                item.Status,
                item.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return Ok(items);
    }


    // GET: api/items/5
    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetItem(
        int id,
        CancellationToken cancellationToken)
    {
        var item = await _db.ItemReports
            .AsNoTracking()
            .Where(item => item.Id == id)
            .Select(item => new
            {
                item.Id,
                item.ReportType,
                item.Title,
                item.Description,
                item.CategoryId,
                CategoryName = item.Category.Name,
                item.LocationId,
                LocationName = item.Location.Name,
                item.EventDate,
                item.Status,
                item.CreatedAt
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (item is null)
            return NotFound(new
            {
                message = "Item report not found."
            });

        return Ok(item);
    }

    // POST: api/items
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateItem(
        [FromBody] CreateItemRequest request,
        CancellationToken cancellationToken)
    {
        var reporterId = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(reporterId))
            return Unauthorized();

        var category = await _db.Categories
            .AsNoTracking()
            .FirstOrDefaultAsync(
                c => c.Id == request.CategoryId && c.IsActive,
                cancellationToken);

        if (category is null)
            return BadRequest(new
            {
                message = "The selected category does not exist or is inactive."
            });

        var location = await _db.Locations
            .AsNoTracking()
            .FirstOrDefaultAsync(
                l => l.Id == request.LocationId && l.IsActive,
                cancellationToken);

        if (location is null)
            return BadRequest(new
            {
                message = "The selected location does not exist or is inactive."
            });

        if (!Enum.IsDefined(typeof(ReportType), request.ReportType))
            return BadRequest(new
            {
                message = "Invalid report type."
            });

        var report = new ItemReport
        {
            ReporterId = reporterId,
            ReportType = request.ReportType,
            Title = request.Title.Trim(),
            Description = request.Description.Trim(),
            CategoryId = request.CategoryId,
            LocationId = request.LocationId,
            EventDate = request.EventDate,
            Status = ItemStatus.Open,
            CreatedAt = DateTime.UtcNow
        };

        _db.ItemReports.Add(report);
        await _db.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(
            nameof(GetItem),
            new { id = report.Id },
            new
            {
                report.Id,
                report.Title,
                report.Status,
                report.CreatedAt
            });
    }

    [HttpGet("mine")]
    [Authorize]
    public async Task<IActionResult> GetMyItems(
        CancellationToken cancellationToken)
    {
        var reporterId = User.FindFirstValue(
            System.Security.Claims.ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(reporterId))
        {
            return Unauthorized();
        }

        var items = await _db.ItemReports
            .AsNoTracking()
            .Where(item => item.ReporterId == reporterId)
            .Select(item => new
            {
                item.Id,
                item.ReportType,
                item.Title,
                item.Description,
                item.CategoryId,
                CategoryName = item.Category.Name,
                CategoryIsSensitive = item.Category.IsSensitive,
                item.LocationId,
                LocationName = item.Location.Name,
                item.EventDate,
                item.Status,
                item.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return Ok(items);
    }

    // PUT: api/items/5/returned
    [HttpPut("{id:int}/returned")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> MarkItemReturned(
        int id,
        CancellationToken cancellationToken)
    {
        var adminId = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(adminId))
            return Unauthorized();

        await using var transaction =
            await _db.Database.BeginTransactionAsync(
                cancellationToken);

        var item = await _db.ItemReports
            .FirstOrDefaultAsync(
                item => item.Id == id,
                cancellationToken);

        if (item is null)
        {
            return NotFound(new
            {
                message = "Item report not found."
            });
        }

        if (item.Status != ItemStatus.Claimed)
        {
            return Conflict(new
            {
                message =
                    "Only claimed items can be marked as returned."
            });
        }

        item.Status = ItemStatus.Returned;
        item.ReturnedAt = DateTime.UtcNow;

        var auditEvent = new AuditEvent
        {
            ActorId = adminId,
            Action = "ItemReturned",
            EntityType = "ItemReport",
            EntityId = item.Id,
            OccurredAt = DateTime.UtcNow,
            Reason = "Item collected by its owner."
        };

        _db.AuditEvents.Add(auditEvent);

        await _db.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return Ok(new
        {
            item.Id,
            item.Title,
            Status = item.Status.ToString(),
            item.ReturnedAt
        });
    }

}


public class CreateItemRequest
{
    [Required]
    public ReportType ReportType { get; set; }

    [Required]
    [StringLength(120, MinimumLength = 1)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [StringLength(2000, MinimumLength = 1)]
    public string Description { get; set; } = string.Empty;

    [Range(1, int.MaxValue)]
    public int CategoryId { get; set; }

    [Range(1, int.MaxValue)]
    public int LocationId { get; set; }

    public DateOnly EventDate { get; set; }
}
