using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using ChurchManager.Api.Data;
using ChurchManager.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ChurchManager.Api.Controllers;

[ApiController]
[Authorize(Roles = "Administrador")]
[Route("api/user-access")]
public sealed class UserAccessController(AppDbContext db, IPasswordHasher<AppUser> hasher) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Create(CreateMemberAccessRequest request, CancellationToken cancellationToken)
    {
        if (!int.TryParse(User.FindFirstValue("church_id"), out var churchId))
            return Unauthorized();

        var name = request.Name?.Trim() ?? string.Empty;
        var email = request.Email?.Trim().ToLowerInvariant() ?? string.Empty;
        var role = request.Role?.Trim() ?? "Membro";
        var status = request.Status?.Trim() ?? "Ativo";

        if (name.Length is < 2 or > 160 || !new EmailAddressAttribute().IsValid(email) || email.Length > 254)
            return BadRequest(new { message = "Informe nome e e-mail válidos." });

        if (request.Password is null || request.Password.Length is < 8 or > 128)
            return BadRequest(new { message = "A senha deve ter entre 8 e 128 caracteres." });

        if (role is not ("Membro" or "Líder" or "Tesouraria"))
            return BadRequest(new { message = "Cargo inválido. Contas criadas por este fluxo não podem ser administradoras." });

        if (status is not ("Ativo" or "Inativo"))
            return BadRequest(new { message = "Status inválido." });

        if (await db.Users.AnyAsync(x => x.Email == email, cancellationToken))
            return Conflict(new { message = "Já existe uma conta com esse e-mail." });

        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            var cargo = await db.Roles.FirstOrDefaultAsync(
                x => x.ChurchId == churchId && x.Name == role,
                cancellationToken);

            if (cargo is null)
            {
                cargo = new ChurchRole
                {
                    ChurchId = churchId,
                    Name = role,
                    Description = "Cargo da equipe da igreja.",
                    PermissionsJson = "[]"
                };
                db.Roles.Add(cargo);
                await db.SaveChangesAsync(cancellationToken);
            }

            var member = new Member
            {
                ChurchId = churchId,
                Name = name,
                Email = email,
                Phone = request.Phone?.Trim() ?? string.Empty,
                Ministry = request.Ministry?.Trim() ?? string.Empty,
                Status = status,
                Role = role
            };

            var user = new AppUser
            {
                ChurchId = churchId,
                CargoId = cargo.Id,
                Name = name,
                Email = email,
                // Cargo organizacional não concede privilégios administrativos na aplicação.
                Role = "Membro",
                IsActive = status == "Ativo"
            };
            user.PasswordHash = hasher.HashPassword(user, request.Password);

            db.Members.Add(member);
            db.Users.Add(user);
            await db.SaveChangesAsync(cancellationToken);

            cargo.Users = await db.Users.CountAsync(
                x => x.ChurchId == churchId && x.CargoId == cargo.Id,
                cancellationToken);
            await db.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            return Created($"/api/members/{member.Id}", new
            {
                member = new
                {
                    id = member.Id,
                    name = member.Name,
                    email = member.Email,
                    phone = member.Phone,
                    ministry = member.Ministry,
                    status = member.Status,
                    role = member.Role,
                    createdAt = member.CreatedAt
                },
                accessCreated = true
            });
        }
        catch (DbUpdateException)
        {
            await transaction.RollbackAsync(cancellationToken);
            return Conflict(new { message = "Não foi possível criar o acesso. Verifique se o e-mail já está cadastrado." });
        }
    }
}

public sealed record CreateMemberAccessRequest(
    [param: Required, StringLength(160, MinimumLength = 2)] string Name,
    [param: Required, EmailAddress, StringLength(254)] string Email,
    [param: Required, StringLength(128, MinimumLength = 8)] string Password,
    [param: StringLength(40)] string? Phone,
    [param: StringLength(120)] string? Ministry,
    [param: Required, StringLength(40)] string Role,
    [param: Required, StringLength(20)] string Status);
