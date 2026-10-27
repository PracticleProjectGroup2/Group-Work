
using JINF.Api.Database;
using JINF.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JINF.Api.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public AdminController(ApplicationDbContext db)
    {
        _db = db;
    }

    // GET: api/admin/stats
    [HttpGet("stats")]
    public async Task<IActionResult> GetStats(
        CancellationToken cancellationToken)
    {
        var openItems = await _db.ItemReports
            .CountAsync(
                item => item.Status == ItemStatus.Open,
                cancellationToken);

        var claimedItems = await _db.ItemReports
            .CountAsync(
                item => item.Status == ItemStatus.Claimed,
                cancellationToken);

        var returnedItems = await _db.ItemReports
            .CountAsync(
                item => item.Status == ItemStatus.Returned,
                cancellationToken);

        var pendingClaims = await _db.Claims
            .CountAsync(
                claim => claim.Status == ClaimStatus.Pending,
                cancellationToken);

        return Ok(new
        {
            open = openItems,
            claimed = claimedItems,
            returned = returnedItems,
            pendingClaims
        });
    }
}
