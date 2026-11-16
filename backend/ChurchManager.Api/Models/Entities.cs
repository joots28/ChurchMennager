using System.Text.Json.Serialization;

namespace ChurchManager.Api.Models;

public interface IChurchOwnedEntity
{
    int Id { get; set; }
    int ChurchId { get; set; }
    DateTime CreatedAt { get; set; }
}

public abstract class ChurchEntity : IChurchOwnedEntity
{
    public int Id { get; set; }
    public int ChurchId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Representa a tabela legada Igreja do banco compartilhado do TCC.
/// </summary>
public sealed class Church
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Conta de acesso armazenada na tabela Usuario do banco legado.
/// </summary>
public sealed class AppUser
{
    public int Id { get; set; }
    public int ChurchId { get; set; }
    public int CargoId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = "Membro";
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public sealed class Member : ChurchEntity
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Ministry { get; set; } = string.Empty;
    public string Status { get; set; } = "Ativo";
    public string Role { get; set; } = "Membro";
}

public sealed class Ministry : ChurchEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Coordinator { get; set; } = string.Empty;
    public string Status { get; set; } = "Ativo";
}

public sealed class ChurchEvent : ChurchEntity
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime StartsAt { get; set; }
    public string Location { get; set; } = string.Empty;
    public string Ministry { get; set; } = "Todos";
    public string Status { get; set; } = "Planejado";
    public bool IsRestricted { get; set; }

    // Campo obrigatório no schema legado; o formulário atual trabalha com "Nenhuma".
    [JsonIgnore]
    public string RecurrenceType { get; set; } = "Nenhuma";
}

public sealed class FinanceTransaction : ChurchEntity
{
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = "Outros";
    public decimal Amount { get; set; }
    public string TransactionType { get; set; } = "Income";
    public DateTime TransactionDate { get; set; }
    public string Method { get; set; } = "PIX";
}

public sealed class ChurchRole : ChurchEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string PermissionsJson { get; set; } = "[]";
    public int Users { get; set; }
}

public sealed class ChurchScale : ChurchEntity
{
    public string Title { get; set; } = string.Empty;
    public string Ministry { get; set; } = string.Empty;
    public DateTime StartsAt { get; set; }
    public string AssignedMembersJson { get; set; } = "[]";
    public string Status { get; set; } = "Pendente";

    // Vínculo opcional com Evento: escalas antigas continuam vinculadas; novas podem ser independentes.
    public int? EventId { get; set; }

    // Coluna legada obrigatória em Escala, mantida para compatibilidade com o banco do grupo.
    [JsonIgnore]
    public string LegacyMinistryName { get; set; } = string.Empty;
}

public sealed record ChurchSettingsRequest(string ChurchName, string Email, string Phone, string Address);
public sealed record AuthResponse(string Token, string Name, string Email, string Role);
