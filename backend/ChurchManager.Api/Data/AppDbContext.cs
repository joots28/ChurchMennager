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

        // The Render PostgreSQL database was created with the original English EF table names.
        // The shared MySQL database used by the team keeps its legacy Portuguese names.
        var usePostgresNames = Database.ProviderName?.Contains("Npgsql", StringComparison.OrdinalIgnoreCase) == true;

        modelBuilder.Entity<Church>(entity =>
        {
            entity.ToTable(usePostgresNames ? "Churches" : "Igreja");
            entity.HasKey(x => x.Id);
            if (!usePostgresNames)
            {
                entity.Property(x => x.Id).HasColumnName("IdIgreja");
                entity.Property(x => x.Name).HasColumnName("Nome");
                entity.Property(x => x.Phone).HasColumnName("Telefone");
                entity.Property(x => x.Address).HasColumnName("Endereco");
            }
            entity.Property(x => x.Name).HasMaxLength(100).IsRequired();
            entity.Property(x => x.Email).HasMaxLength(254).IsRequired();
            entity.Property(x => x.Phone).HasMaxLength(40).IsRequired();
            entity.Property(x => x.Address).HasMaxLength(255).IsRequired();
            entity.Property(x => x.CreatedAt);
            entity.HasIndex(x => x.Email);
        });

        modelBuilder.Entity<AppUser>(entity =>
        {
            entity.ToTable(usePostgresNames ? "Users" : "Usuario");
            entity.HasKey(x => x.Id);
            if (!usePostgresNames)
            {
                entity.Property(x => x.Id).HasColumnName("IdUsuario");
                entity.Property(x => x.ChurchId).HasColumnName("IdIgreja");
                entity.Property(x => x.CargoId).HasColumnName("IdCargo");
                entity.Property(x => x.Name).HasColumnName("Nome");
                entity.Property(x => x.PasswordHash).HasColumnName("SenhaHash");
                entity.Property(x => x.Role).HasColumnName("Perfil");
                entity.Property(x => x.IsActive).HasColumnName("Ativo");
            }
            entity.Property(x => x.Name).HasMaxLength(100).IsRequired();
            entity.Property(x => x.Email).HasMaxLength(254).IsRequired();
            entity.Property(x => x.PasswordHash).HasMaxLength(255).IsRequired();
            entity.Property(x => x.Role).HasMaxLength(80).IsRequired();
            entity.Property(x => x.CreatedAt);
            entity.HasIndex(x => x.Email).IsUnique();
            entity.HasOne<Church>().WithMany().HasForeignKey(x => x.ChurchId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne<ChurchRole>().WithMany().HasForeignKey(x => x.CargoId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Member>(entity =>
        {
            entity.ToTable(usePostgresNames ? "Members" : "Membro");
            entity.HasKey(x => x.Id);
            if (!usePostgresNames)
            {
                entity.Property(x => x.Id).HasColumnName("IdMembro");
                entity.Property(x => x.ChurchId).HasColumnName("IdIgreja");
                entity.Property(x => x.Name).HasColumnName("Nome");
                entity.Property(x => x.Phone).HasColumnName("Telefone");
                entity.Property(x => x.Ministry).HasColumnName("Ministerio");
                entity.Property(x => x.Role).HasColumnName("Cargo");
            }
            entity.Property(x => x.Name).HasMaxLength(160).IsRequired();
            entity.Property(x => x.Email).HasMaxLength(254).IsRequired();
            entity.Property(x => x.Phone).HasMaxLength(40).IsRequired();
            entity.Property(x => x.Ministry).HasMaxLength(120).IsRequired();
            entity.Property(x => x.Status).HasMaxLength(40).IsRequired();
            entity.Property(x => x.Role).HasMaxLength(80).IsRequired();
            entity.Property(x => x.CreatedAt);
            entity.HasIndex(x => x.ChurchId);
            entity.HasOne<Church>().WithMany().HasForeignKey(x => x.ChurchId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Ministry>(entity =>
        {
            entity.ToTable(usePostgresNames ? "Ministries" : "Ministerio");
            entity.HasKey(x => x.Id);
            if (!usePostgresNames)
            {
                entity.Property(x => x.Id).HasColumnName("IdMinisterio");
                entity.Property(x => x.ChurchId).HasColumnName("IdIgreja");
                entity.Property(x => x.Name).HasColumnName("Nome");
                entity.Property(x => x.Description).HasColumnName("Descricao");
                entity.Property(x => x.Coordinator).HasColumnName("Coordenador");
            }
            entity.Property(x => x.Name).HasMaxLength(160).IsRequired();
            entity.Property(x => x.Description).HasMaxLength(500).IsRequired();
            entity.Property(x => x.Coordinator).HasMaxLength(160).IsRequired();
            entity.Property(x => x.Status).HasMaxLength(40).IsRequired();
            entity.Property(x => x.CreatedAt);
            entity.HasIndex(x => x.ChurchId);
            entity.HasOne<Church>().WithMany().HasForeignKey(x => x.ChurchId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ChurchEvent>(entity =>
        {
            entity.ToTable(usePostgresNames ? "Events" : "Evento");
            entity.HasKey(x => x.Id);
            if (!usePostgresNames)
            {
                entity.Property(x => x.Id).HasColumnName("IdEvento");
                entity.Property(x => x.ChurchId).HasColumnName("IdIgreja");
                entity.Property(x => x.Title).HasColumnName("Titulo");
                entity.Property(x => x.Description).HasColumnName("Descricao");
                entity.Property(x => x.StartsAt).HasColumnName("DataHora");
                entity.Property(x => x.Location).HasColumnName("Local");
                entity.Property(x => x.Ministry).HasColumnName("Ministerio");
                entity.Property(x => x.IsRestricted).HasColumnName("Restrito");
                entity.Property(x => x.RecurrenceType).HasColumnName("TipoRepeticao");
            }
            entity.Property(x => x.Title).HasMaxLength(100).IsRequired();
            entity.Property(x => x.Description).IsRequired();
            entity.Property(x => x.Location).HasMaxLength(255).IsRequired();
            entity.Property(x => x.Ministry).HasMaxLength(120).IsRequired();
            entity.Property(x => x.Status).HasMaxLength(40).IsRequired();
            entity.Property(x => x.RecurrenceType).HasMaxLength(50).IsRequired();
            entity.Property(x => x.CreatedAt);
            entity.HasIndex(x => x.ChurchId);
            entity.HasIndex(x => new { x.ChurchId, x.StartsAt });
            entity.HasOne<Church>().WithMany().HasForeignKey(x => x.ChurchId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<FinanceTransaction>(entity =>
        {
            entity.ToTable(usePostgresNames ? "Transactions" : "MovimentacaoFinanceira");
            entity.HasKey(x => x.Id);
            if (!usePostgresNames)
            {
                entity.Property(x => x.Id).HasColumnName("IdMovimentacao");
                entity.Property(x => x.ChurchId).HasColumnName("IdIgreja");
                entity.Property(x => x.Description).HasColumnName("Descricao");
                entity.Property(x => x.Category).HasColumnName("Categoria");
                entity.Property(x => x.Amount).HasColumnName("Valor");
                entity.Property(x => x.TransactionType).HasColumnName("Tipo");
                entity.Property(x => x.TransactionDate).HasColumnName("DataMovimentacao");
                entity.Property(x => x.Method).HasColumnName("Metodo");
            }
            entity.Property(x => x.Description).HasMaxLength(180).IsRequired();
            entity.Property(x => x.Category).HasMaxLength(100).IsRequired();
            entity.Property(x => x.Amount).HasPrecision(12, 2);
            entity.Property(x => x.TransactionType).HasMaxLength(30).IsRequired();
            entity.Property(x => x.Method).HasMaxLength(50).IsRequired();
            entity.Property(x => x.CreatedAt);
            entity.HasIndex(x => x.ChurchId);
            entity.HasIndex(x => new { x.ChurchId, x.TransactionDate });
            entity.HasOne<Church>().WithMany().HasForeignKey(x => x.ChurchId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ChurchRole>(entity =>
        {
            entity.ToTable(usePostgresNames ? "Roles" : "Cargo");
            entity.HasKey(x => x.Id);
            if (!usePostgresNames)
            {
                entity.Property(x => x.Id).HasColumnName("IdCargo");
                entity.Property(x => x.ChurchId).HasColumnName("IdIgreja");
                entity.Property(x => x.Name).HasColumnName("Nome");
                entity.Property(x => x.Description).HasColumnName("Descricao");
                entity.Property(x => x.PermissionsJson).HasColumnName("PermissoesJson");
                entity.Property(x => x.Users).HasColumnName("QuantidadeUsuarios");
            }
            entity.Property(x => x.Name).HasMaxLength(50).IsRequired();
            entity.Property(x => x.Description).HasMaxLength(500).IsRequired();
            entity.Property(x => x.PermissionsJson).HasColumnType("text").IsRequired();
            entity.Property(x => x.CreatedAt);
            entity.HasIndex(x => x.ChurchId);
            entity.HasOne<Church>().WithMany().HasForeignKey(x => x.ChurchId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ChurchScale>(entity =>
        {
            entity.ToTable(usePostgresNames ? "Scales" : "Escala");
            entity.HasKey(x => x.Id);
            if (!usePostgresNames)
            {
                entity.Property(x => x.Id).HasColumnName("IdEscala");
                entity.Property(x => x.ChurchId).HasColumnName("IdIgreja");
                entity.Property(x => x.Title).HasColumnName("Titulo");
                entity.Property(x => x.Ministry).HasColumnName("Ministerio");
                entity.Property(x => x.StartsAt).HasColumnName("DataHora");
                entity.Property(x => x.AssignedMembersJson).HasColumnName("MembrosJson");
                entity.Property(x => x.EventId).HasColumnName("IdEvento");
                entity.Property(x => x.LegacyMinistryName).HasColumnName("NomeMinisterio");
            }
            entity.Property(x => x.Title).HasMaxLength(180).IsRequired();
            entity.Property(x => x.Ministry).HasMaxLength(120).IsRequired();
            entity.Property(x => x.AssignedMembersJson).HasColumnType("text").IsRequired();
            entity.Property(x => x.Status).HasMaxLength(40).IsRequired();
            entity.Property(x => x.LegacyMinistryName).HasMaxLength(100).IsRequired();
            entity.Property(x => x.CreatedAt);
            entity.HasIndex(x => x.ChurchId);
            entity.HasIndex(x => new { x.ChurchId, x.StartsAt });
            entity.HasOne<Church>().WithMany().HasForeignKey(x => x.ChurchId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne<ChurchEvent>().WithMany().HasForeignKey(x => x.EventId).OnDelete(DeleteBehavior.SetNull);
        });
    }
}
