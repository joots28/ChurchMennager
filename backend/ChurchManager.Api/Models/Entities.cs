namespace ChurchManager.Api.Models;

public interface IChurchOwnedEntity { int Id { get; set; } int ChurchId { get; set; } DateTime CreatedAt { get; set; } }
public abstract class ChurchEntity : IChurchOwnedEntity
{
    public int Id { get; set; }
    public int ChurchId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
public sealed class Church
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
    public string Phone { get; set; } = "";
    public string Address { get; set; } = "";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
public sealed class AppUser
{
    public int Id { get; set; }
    public int ChurchId { get; set; }
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public string Role { get; set; } = "Membro";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
public sealed class Member : ChurchEntity
{
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
    public string Phone { get; set; } = "";
    public string Ministry { get; set; } = "";
    public string Status { get; set; } = "Ativo";
    public string Role { get; set; } = "Membro";
}
public sealed class Ministry : ChurchEntity
{
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public string Coordinator { get; set; } = "";
    public string Status { get; set; } = "Ativo";
}
public sealed class ChurchEvent : ChurchEntity
{
    public string Title { get; set; } = "";
    public string Description { get; set; } = "";
    public DateTime StartsAt { get; set; }
    public string Location { get; set; } = "";
    public string Ministry { get; set; } = "Todos";
    public string Status { get; set; } = "Planejado";
}
public sealed class FinanceTransaction : ChurchEntity
{
    public string Description { get; set; } = "";
    public string Category { get; set; } = "Outros";
    public decimal Amount { get; set; }
    public string TransactionType { get; set; } = "Income";
    public DateTime TransactionDate { get; set; }
    public string Method { get; set; } = "PIX";
}
public sealed class ChurchRole : ChurchEntity
{
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public string PermissionsJson { get; set; } = "[]";
    public int Users { get; set; }
}
public sealed class ChurchScale : ChurchEntity
{
    public string Title { get; set; } = "";
    public string Ministry { get; set; } = "";
    public DateTime StartsAt { get; set; }
    public string AssignedMembersJson { get; set; } = "[]";
    public string Status { get; set; } = "Pendente";
}
public sealed record ChurchSettingsRequest(string ChurchName, string Email, string Phone, string Address);
public sealed record AuthResponse(string Token, string Name, string Email, string Role);