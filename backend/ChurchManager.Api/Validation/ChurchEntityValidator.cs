using System.ComponentModel.DataAnnotations;
using System.Text.Json;
using ChurchManager.Api.Models;

namespace ChurchManager.Api.Validation;

/// <summary>Centraliza validações aplicadas no servidor, independentemente do formulário do navegador.</summary>
public static class ChurchEntityValidator
{
    private static readonly HashSet<string> Permissions = new(StringComparer.Ordinal)
    { "Membros", "Eventos", "Financeiro", "Relatórios", "Configurações", "Perfil", "Escalas" };

    public static string? Validate(IChurchOwnedEntity entity) => entity switch
    {
        Member x => Required(x.Name, "Nome completo", 160) ??
                    Optional(x.Email, "E-mail", 254) ?? EmailIfPresent(x.Email) ??
                    Optional(x.Phone, "Telefone", 40) ??
                    Choice(x.Ministry, "Ministério", "Louvor", "Recepção", "Ministério Infantil", "Infantil", "Comunicação", "Assistência", "Jovens", "Todos") ??
                    Choice(x.Status, "Status", "Ativo", "Inativo") ??
                    Choice(x.Role, "Cargo", "Membro", "Líder", "Administrador", "Tesouraria"),
        Ministry x => Required(x.Name, "Nome do ministério", 160) ??
                      Optional(x.Description, "Descrição", 500) ?? Optional(x.Coordinator, "Coordenador", 160) ??
                      Choice(x.Status, "Status", "Ativo", "Inativo"),
        ChurchEvent x => Required(x.Title, "Nome do evento", 180) ??
                         (x.StartsAt == default ? "Informe a data e o horário do evento." : null) ??
                         Optional(x.Description, "Descrição", 1000) ?? Optional(x.Location, "Local", 180) ??
                         Choice(x.Ministry, "Ministério", "Todos", "Louvor", "Recepção", "Ministério Infantil", "Comunicação", "Assistência", "Jovens") ??
                         Choice(x.Status, "Status", "Planejado", "Confirmado", "Cancelado"),
        FinanceTransaction x => Required(x.Description, "Descrição", 180) ??
                                (x.Amount <= 0 || x.Amount > 9_999_999_999.99m || decimal.Round(x.Amount, 2) != x.Amount
                                    ? "Informe um valor maior que zero, com no máximo duas casas decimais." : null) ??
                                (x.TransactionDate == default ? "Informe a data da movimentação." : null) ??
                                Choice(x.Category, "Categoria", "Ofertas", "Contribuições", "Doações", "Despesas fixas", "Manutenção", "Eventos", "Outros") ??
                                Choice(x.TransactionType, "Tipo de movimentação", "Income", "Expense") ??
                                Choice(x.Method, "Método", "PIX", "Transferência", "Dinheiro", "Cartão", "Outro"),
        ChurchRole x => Required(x.Name, "Nome do cargo", 120) ?? Optional(x.Description, "Descrição", 500) ?? ValidatePermissions(x.PermissionsJson),
        ChurchScale x => Required(x.Title, "Nome da escala", 180) ??
                         Choice(x.Ministry, "Ministério", "Louvor", "Recepção", "Ministério Infantil", "Comunicação", "Assistência", "Jovens") ??
                         (x.StartsAt == default ? "Informe a data e o horário da escala." : null) ??
                         Choice(x.Status, "Status", "Pendente", "Confirmada", "Concluída") ?? ValidateAssignedMembers(x.AssignedMembersJson),
        _ => "Tipo de registro não reconhecido."
    };

    public static void Normalize(IChurchOwnedEntity entity)
    {
        switch (entity)
        {
            case Member x: x.Name = Trim(x.Name); x.Email = Trim(x.Email).ToLowerInvariant(); x.Phone = Trim(x.Phone); x.Ministry = Trim(x.Ministry); x.Status = Trim(x.Status); x.Role = Trim(x.Role); break;
            case Ministry x: x.Name = Trim(x.Name); x.Description = Trim(x.Description); x.Coordinator = Trim(x.Coordinator); x.Status = Trim(x.Status); break;
            case ChurchEvent x: x.Title = Trim(x.Title); x.Description = Trim(x.Description); x.Location = Trim(x.Location); x.Ministry = Trim(x.Ministry); x.Status = Trim(x.Status); break;
            case FinanceTransaction x: x.Description = Trim(x.Description); x.Category = Trim(x.Category); x.TransactionType = Trim(x.TransactionType); x.Method = Trim(x.Method); break;
            case ChurchRole x: x.Name = Trim(x.Name); x.Description = Trim(x.Description); x.PermissionsJson = string.IsNullOrWhiteSpace(x.PermissionsJson) ? "[]" : x.PermissionsJson.Trim(); break;
            case ChurchScale x: x.Title = Trim(x.Title); x.Ministry = Trim(x.Ministry); x.Status = Trim(x.Status); x.AssignedMembersJson = string.IsNullOrWhiteSpace(x.AssignedMembersJson) ? "[]" : x.AssignedMembersJson.Trim(); break;
        }
    }

    private static string? Required(string? value, string label, int max)
    {
        if (string.IsNullOrWhiteSpace(value)) return $"O campo {label} é obrigatório.";
        var length = value.Trim().Length;
        if (length < 2) return $"O campo {label} deve ter pelo menos 2 caracteres.";
        return length > max ? $"O campo {label} deve ter no máximo {max} caracteres." : null;
    }
    private static string? Optional(string? value, string label, int max) =>
        (value?.Trim().Length ?? 0) > max ? $"O campo {label} deve ter no máximo {max} caracteres." : null;
    private static string? Choice(string? value, string label, params string[] allowed) =>
        allowed.Contains(value, StringComparer.Ordinal) ? null : $"Selecione uma opção válida para {label}.";
    private static string? EmailIfPresent(string? value) =>
        string.IsNullOrWhiteSpace(value) || new EmailAddressAttribute().IsValid(value.Trim()) ? null : "Informe um e-mail válido ou deixe o campo vazio.";
    private static string? ValidatePermissions(string? json)
    {
        if ((json?.Length ?? 0) > 2048) return "A lista de permissões ultrapassa o limite permitido.";
        try
        {
            var values = JsonSerializer.Deserialize<List<string>>(string.IsNullOrWhiteSpace(json) ? "[]" : json);
            return values is null || values.Count > Permissions.Count || values.Any(p => !Permissions.Contains(p))
                ? "A lista de permissões contém valores inválidos." : null;
        }
        catch (JsonException) { return "A lista de permissões está em um formato inválido."; }
    }
    private static string? ValidateAssignedMembers(string? json)
    {
        if ((json?.Length ?? 0) > 100_000) return "A lista de participantes ultrapassa o limite permitido.";
        try
        {
            var values = JsonSerializer.Deserialize<List<string>>(string.IsNullOrWhiteSpace(json) ? "[]" : json);
            return values is null || values.Count > 500 || values.Any(x => string.IsNullOrWhiteSpace(x) || x.Length > 160)
                ? "A lista de participantes da escala é inválida." : null;
        }
        catch (JsonException) { return "A lista de participantes da escala está em um formato inválido."; }
    }
    private static string Trim(string? value) => value?.Trim() ?? string.Empty;
}
