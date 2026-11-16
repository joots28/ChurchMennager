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
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Church>(entity =>
        {
            entity.ToTable("Igreja");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasColumnName("IdIgreja");
            entity.Property(x => x.Name).HasColumnName("Nome").HasMaxLength(100).IsRequired();
            entity.Property(x => x.Email).HasMaxLength(254).IsRequired();
            entity.Property(x => x.Phone).HasColumnName("Telefone").HasMaxLength(40).IsRequired();
            entity.Property(x => x.Address).HasColumnName("Endereco").HasMaxLength(255).IsRequired();
            entity.Property(x => x.CreatedAt);
            entity.HasIndex(x => x.Email);
        });

        modelBuilder.Entity<AppUser>(entity =>
        {
            entity.ToTable("Usuario");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasColumnName("IdUsuario");
            entity.Property(x => x.ChurchId).HasColumnName("IdIgreja");
            entity.Property(x => x.CargoId).HasColumnName("IdCargo");
            entity.Property(x => x.Name).HasColumnName("Nome").HasMaxLength(100).IsRequired();
            entity.Property(x => x.Email).HasMaxLength(254).IsRequired();
            entity.Property(x => x.PasswordHash).HasColumnName("SenhaHash").HasMaxLength(255).IsRequired();
            entity.Property(x => x.Role).HasColumnName("Perfil").HasMaxLength(80).IsRequired();
            entity.Property(x => x.CreatedAt);
            entity.HasIndex(x => x.Email).IsUnique();
            entity.HasOne<Church>().WithMany().HasForeignKey(x => x.ChurchId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne<ChurchRole>().WithMany().HasForeignKey(x => x.CargoId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Member>(entity =>
        {
            entity.ToTable("Membro");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasColumnName("IdMembro");
            entity.Property(x => x.ChurchId).HasColumnName("IdIgreja");
            entity.Property(x => x.Name).HasColumnName("Nome").HasMaxLength(160).IsRequired();
            entity.Property(x => x.Email).HasMaxLength(254).IsRequired();
            entity.Property(x => x.Phone).HasColumnName("Telefone").HasMaxLength(40).IsRequired();
            entity.Property(x => x.Ministry).HasColumnName("Ministerio").HasMaxLength(120).IsRequired();
            entity.Property(x => x.Status).HasMaxLength(40).IsRequired();
            entity.Property(x => x.Role).HasColumnName("Cargo").HasMaxLength(80).IsRequired();
            entity.Property(x => x.CreatedAt);
            entity.HasIndex(x => x.ChurchId);
            entity.HasOne<Church>().WithMany().HasForeignKey(x => x.ChurchId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Ministry>(entity =>
        {
            entity.ToTable("Ministerio");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasColumnName("IdMinisterio");
            entity.Property(x => x.ChurchId).HasColumnName("IdIgreja");
            entity.Property(x => x.Name).HasColumnName("Nome").HasMaxLength(160).IsRequired();
            entity.Property(x => x.Description).HasColumnName("Descricao").HasMaxLength(500).IsRequired();
            entity.Property(x => x.Coordinator).HasColumnName("Coordenador").HasMaxLength(160).IsRequired();
            entity.Property(x => x.Status).HasMaxLength(40).IsRequired();
            entity.Property(x => x.CreatedAt);
            entity.HasIndex(x => x.ChurchId);
            entity.HasOne<Church>().WithMany().HasForeignKey(x => x.ChurchId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ChurchEvent>(entity =>
        {
            entity.ToTable("Evento");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasColumnName("IdEvento");
            entity.Property(x => x.ChurchId).HasColumnName("IdIgreja");
            entity.Property(x => x.Title).HasColumnName("Titulo").HasMaxLength(100).IsRequired();
            entity.Property(x => x.Description).HasColumnName("Descricao").IsRequired();
            entity.Property(x => x.StartsAt).HasColumnName("DataHora");
            entity.Property(x => x.Location).HasColumnName("Local").HasMaxLength(255).IsRequired();
            entity.Property(x => x.Ministry).HasColumnName("Ministerio").HasMaxLength(120).IsRequired();
            entity.Property(x => x.Status).HasMaxLength(40).IsRequired();
            entity.Property(x => x.IsRestricted).HasColumnName("Restrito");
            entity.Property(x => x.CreatedAt);
            entity.HasIndex(x => x.ChurchId);
            entity.HasIndex(x => new { x.ChurchId, x.StartsAt });
            entity.HasOne<Church>().WithMany().HasForeignKey(x => x.ChurchId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<FinanceTransaction>(entity =>
        {
            entity.ToTable("MovimentacaoFinanceira");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasColumnName("IdMovimentacao");
            entity.Property(x => x.ChurchId).HasColumnName("IdIgreja");
            entity.Property(x => x.Description).HasColumnName("Descricao").HasMaxLength(180).IsRequired();
            entity.Property(x => x.Category).HasColumnName("Categoria").HasMaxLength(100).IsRequired();
            entity.Property(x => x.Amount).HasColumnName("Valor").HasPrecision(12, 2);
            entity.Property(x => x.TransactionType).HasColumnName("Tipo").HasMaxLength(30).IsRequired();
            entity.Property(x => x.TransactionDate).HasColumnName("DataMovimentacao");
            entity.Property(x => x.Method).HasColumnName("Metodo").HasMaxLength(50).IsRequired();
            entity.Property(x => x.CreatedAt);
            entity.HasIndex(x => x.ChurchId);
            entity.HasIndex(x => new { x.ChurchId, x.TransactionDate });
            entity.HasOne<Church>().WithMany().HasForeignKey(x => x.ChurchId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ChurchRole>(entity =>
        {
            entity.ToTable("Cargo");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasColumnName("IdCargo");
            entity.Property(x => x.ChurchId).HasColumnName("IdIgreja");
            entity.Property(x => x.Name).HasColumnName("Nome").HasMaxLength(50).IsRequired();
            entity.Property(x => x.Description).HasColumnName("Descricao").HasMaxLength(500).IsRequired();
            entity.Property(x => x.PermissionsJson).HasColumnName("PermissoesJson").HasColumnType("text").IsRequired();
            entity.Property(x => x.Users).HasColumnName("QuantidadeUsuarios");
            entity.Property(x => x.CreatedAt);
            entity.HasIndex(x => x.ChurchId);
            entity.HasOne<Church>().WithMany().HasForeignKey(x => x.ChurchId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ChurchScale>(entity =>
        {
            entity.ToTable("Escala");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasColumnName("IdEscala");
            entity.Property(x => x.ChurchId).HasColumnName("IdIgreja");
            entity.Property(x => x.Title).HasColumnName("Titulo").HasMaxLength(180).IsRequired();
            entity.Property(x => x.Ministry).HasColumnName("Ministerio").HasMaxLength(120).IsRequired();
            entity.Property(x => x.StartsAt).HasColumnName("DataHora");
            entity.Property(x => x.AssignedMembersJson).HasColumnName("MembrosJson").HasColumnType("text").IsRequired();
            entity.Property(x => x.Status).HasMaxLength(40).IsRequired();
            entity.Property(x => x.EventId).HasColumnName("IdEvento");
            entity.Property(x => x.LegacyMinistryName).HasColumnName("NomeMinisterio").HasMaxLength(100).IsRequired();
            entity.Property(x => x.CreatedAt);
            entity.HasIndex(x => x.ChurchId);
            entity.HasIndex(x => new { x.ChurchId, x.StartsAt });
            entity.HasOne<Church>().WithMany().HasForeignKey(x => x.ChurchId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne<ChurchEvent>().WithMany().HasForeignKey(x => x.EventId).OnDelete(DeleteBehavior.SetNull);
        });
    }
}
