using JINF.Api.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace JINF.Api.Database;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<ItemReport> ItemReports => Set<ItemReport>();
    public DbSet<Claim> Claims => Set<Claim>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Location> Locations => Set<Location>();
    public DbSet<Photo> Photos => Set<Photo>();
    public DbSet<AuditEvent> AuditEvents => Set<AuditEvent>();
}