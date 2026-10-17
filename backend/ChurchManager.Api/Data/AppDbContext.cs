using ChurchManager.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ChurchManager.Api.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Church> Churches => Set<Church>();
    public DbSet<AppUser> Users => Set<AppUser>();
    public DbSet<Member> Members => Set<Member>();
    public DbSet<Ministry> Ministries => Set<Ministry>();
    public DbSet<ChurchEvent> Events => Set<ChurchEvent>();
    public DbSet<FinanceTransaction> Transactions => Set<FinanceTransaction>();
    public DbSet<ChurchRole> Roles => Set<ChurchRole>();
    public DbSet<ChurchScale> Scales => Set<ChurchScale>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Church>().HasIndex(x => x.Email);
        modelBuilder.Entity<AppUser>().HasIndex(x => x.Email).IsUnique();
        modelBuilder.Entity<AppUser>().Property(x => x.Email).HasMaxLength(254);
        modelBuilder.Entity<AppUser>().Property(x => x.PasswordHash).HasMaxLength(512);
        modelBuilder.Entity<FinanceTransaction>().Property(x => x.Amount).HasPrecision(12, 2);
        foreach (var type in new[] { typeof(Member), typeof(Ministry), typeof(ChurchEvent), typeof(FinanceTransaction), typeof(ChurchRole), typeof(ChurchScale) })
            modelBuilder.Entity(type).HasIndex(nameof(IChurchOwnedEntity.ChurchId));
    }
}