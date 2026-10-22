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

    protected override void OnModelCreating(ModelBuilder builder)
    {
        
        base.OnModelCreating(builder);

        builder.Entity<ApplicationUser>(entity =>
        {
            entity.Property(user => user.FullName)
                .HasMaxLength(100)
                .IsRequired();
        });

        builder.Entity<Category>(entity =>
        {
            entity.Property(category => category.Name)
                .HasMaxLength(100)
                .IsRequired();
        });

        builder.Entity<Location>(entity =>
        {
            entity.Property(location => location.Name)
                .HasMaxLength(100)
                .IsRequired();
        });

        builder.Entity<ItemReport>(entity =>
        {
            entity.Property(report => report.Title)
                .HasMaxLength(120)
                .IsRequired();

            entity.Property(report => report.Description)
                .HasMaxLength(2000)
                .IsRequired();

            entity.HasOne(report => report.Reporter)
                .WithMany()
                .HasForeignKey(report => report.ReporterId)
                .OnDelete(DeleteBehavior.ClientNoAction);

            entity.HasOne(report => report.ReturnedBy)
                .WithMany()
                .HasForeignKey(report => report.ReturnedById)
                .OnDelete(DeleteBehavior.ClientNoAction);

            entity.HasOne(report => report.Category)
                .WithMany()
                .HasForeignKey(report => report.CategoryId)
                .OnDelete(DeleteBehavior.ClientNoAction);

            entity.HasOne(report => report.Location)
                .WithMany()
                .HasForeignKey(report => report.LocationId)
                .OnDelete(DeleteBehavior.ClientNoAction);
        });

        builder.Entity<Claim>(entity =>
        {
            entity.Property(claim => claim.ProofOfOwnership)
                .HasMaxLength(2000)
                .IsRequired();

            entity.Property(claim => claim.DecisionReason)
                .HasMaxLength(500);

            entity.Property(claim => claim.Status)
                .HasConversion<int>();

            entity.HasOne(claim => claim.ItemReport)
                .WithMany(report => report.Claims)
                .HasForeignKey(claim => claim.ItemReportId)
                .OnDelete(DeleteBehavior.ClientNoAction);

            entity.HasOne(claim => claim.Claimant)
                .WithMany()
                .HasForeignKey(claim => claim.ClaimantId)
                .OnDelete(DeleteBehavior.ClientNoAction);

            entity.HasOne(claim => claim.ReviewedBy)
                .WithMany()
                .HasForeignKey(claim => claim.ReviewedById)
                .OnDelete(DeleteBehavior.ClientNoAction);

            // A user can submit only one claim for a report.
            entity.HasIndex(claim => new
            {
                claim.ItemReportId,
                claim.ClaimantId
            })
                .IsUnique();

            // PostgreSQL filter: Approved has enum value 1.
            entity.HasIndex(claim => claim.ItemReportId)
                .IsUnique()
                .HasFilter("\"Status\" = 1");
        });

        builder.Entity<Photo>(entity =>
        {
            entity.Property(photo => photo.StorageKey)
                .HasMaxLength(500)
                .IsRequired();

            entity.Property(photo => photo.ContentType)
                .HasMaxLength(100)
                .IsRequired();

            entity.HasIndex(photo => photo.StorageKey)
                .IsUnique();

            entity.HasOne(photo => photo.ItemReport)
                .WithOne(report => report.Photo)
                .HasForeignKey<Photo>(photo => photo.ItemReportId)
                .OnDelete(DeleteBehavior.ClientNoAction);
        });

        builder.Entity<AuditEvent>(entity =>
        {
            entity.Property(audit => audit.Action)
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(audit => audit.EntityType)
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(audit => audit.Reason)
                .HasMaxLength(500);

            entity.HasOne(audit => audit.Actor)
                .WithMany()
                .HasForeignKey(audit => audit.ActorId)
                .OnDelete(DeleteBehavior.ClientNoAction);
        });
    }
}