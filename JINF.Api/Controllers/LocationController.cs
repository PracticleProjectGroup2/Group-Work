
using JINF.Api.Database;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JINF.Api.Controllers;

[ApiController]
[Route("api/locations")]
public class LocationController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public LocationController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetLocations(
        CancellationToken cancellationToken)
    {
        var locations = await _db.Locations
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        return Ok(locations);
    }
}
