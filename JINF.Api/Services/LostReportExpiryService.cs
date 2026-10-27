
using JINF.Api.Database;
using JINF.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace JINF.Api.Services;

public class LostReportExpiryService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<LostReportExpiryService> _logger;

    public LostReportExpiryService(
        IServiceScopeFactory scopeFactory,
        ILogger<LostReportExpiryService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(
        CancellationToken stoppingToken)
    {
        // Check immediately when the API starts.
        // Then check once every hour.
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ArchiveExpiredLostReports(stoppingToken);
            }
            catch (OperationCanceledException)
                when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Failed to archive expired Lost reports.");
            }

            try
            {
                await Task.Delay(
                    TimeSpan.FromHours(1),
                    stoppingToken);
            }
            catch (OperationCanceledException)
                when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
        }
    }

    private async Task ArchiveExpiredLostReports(
        CancellationToken cancellationToken)
    {
        using var scope = _scopeFactory.CreateScope();

        var db = scope.ServiceProvider
            .GetRequiredService<ApplicationDbContext>();

        var expiryDate = DateTime.UtcNow.AddDays(-90);

        var expiredReports = await db.ItemReports
            .Where(item =>
                item.ReportType == ReportType.Lost &&
                item.Status == ItemStatus.Open &&
                item.CreatedAt <= expiryDate)
            .ToListAsync(cancellationToken);

        foreach (var item in expiredReports)
        {
            item.Status = ItemStatus.Archived;
            item.UpdatedAt = DateTime.UtcNow;
        }

        if (expiredReports.Count > 0)
        {
            await db.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "Archived {Count} expired Lost reports.",
                expiredReports.Count);
        }
    }
}
