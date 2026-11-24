using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ChurchManager.Api.Data;
using ChurchManager.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace ChurchManager.Api.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController(
    AppDbContext db,
    IConfiguration config,
    IPasswordHasher<AppUser> hasher,
    IWebHostEnvironment environment) : ControllerBase
{
    [AllowAnonymous]
    [EnableRateLimiting("Auth")]
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request, CancellationToken cancellationToken)
    {
        var allowPublicRegistration = bool.TryParse(
            Environment.GetEnvironmentVariable("AUTH_ALLOW_PUBLIC_REGISTRATION"),
            out var environmentSetting)
            ? environmentSetting
            : config.GetValue<bool>("Auth:AllowPublicRegistration");

        if (!environment.IsDevelopment() && !allowPublicRegistration)
            return StatusCode(StatusCodes.Status403Forbidden, new
            {
                message = "O cadastro de novas igrejas está temporariamente desativado. Solicite acesso ao administrador."
            });

        var name = request.Name?.Trim() ?? string.Empty;
        var email = request.Email?.Trim().ToLowerInvariant() ?? string.Empty;
        var churchName = request.ChurchName?.Trim() ?? string.Empty;

        if (name.Length is < 2 or > 100 || churchName.Length is < 2 or > 100 ||
            email.Length > 254 || !new EmailAddressAttribute().IsValid(email))
            return BadRequest(new { message = "Informe nome, e-mail válido e nome da igreja." });

        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length is < 8 or > 128)
            return BadRequest(new { message = "A senha deve ter entre 8 e 128 caracteres." });

        if (await db.Users.AnyAsync(x => x.Email == email, cancellationToken))
            return Conflict(new { message = "Já existe uma conta com esse e-mail." });

        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            var church = new Church { Name = churchName, Email = email };
            db.Churches.Add(church);
            await db.SaveChangesAsync(cancellationToken);

            var adminRole = new ChurchRole
            {
                ChurchId = church.Id,
                Name = "Administrador",
                Description = "Administrador principal da igreja.",
                PermissionsJson = "[\"Membros\",\"Eventos\",\"Financeiro\",\"Relatórios\",\"Configurações\",\"Perfil\",\"Escalas\"]",
                Users = 1
            };
            db.Roles.Add(adminRole);
            await db.SaveChangesAsync(cancellationToken);

            var user = new AppUser
            {
                ChurchId = church.Id,
                CargoId = adminRole.Id,
                Name = name,
                Email = email,
                Role = "Administrador"
            };
            user.PasswordHash = hasher.HashPassword(user, request.Password);
            db.Users.Add(user);
            await db.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            return Ok(CreateSession(user));
        }
        catch (DbUpdateException)
        {
            await transaction.RollbackAsync(cancellationToken);
            return Conflict(new { message = "Não foi possível concluir o cadastro. Verifique os dados e tente novamente." });
        }
    }

    [AllowAnonymous]
    [EnableRateLimiting("Login")]
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request, CancellationToken cancellationToken)
    {
        var identifier = request.Identifier?.Trim() ?? string.Empty;
        var password = request.Password ?? string.Empty;
        var portal = request.Portal?.Trim().ToLowerInvariant() ?? "admin";

        if (identifier.Length is 0 or > 254 || password.Length is 0 or > 128)
            return BadRequest(new { message = "Informe usuário/e-mail e senha." });

        if (portal is not ("admin" or "member"))
            return BadRequest(new { message = "Área de acesso inválida." });

        AppUser? user;
        if (identifier.Contains('@'))
        {
            var matches = await db.Users
                .Where(x => x.Email == identifier.ToLowerInvariant() && x.IsActive)
                .Take(2)
                .ToListAsync(cancellationToken);
            user = matches.Count == 1 ? matches[0] : null;
        }
        else
        {
            var matches = await db.Users
                .Where(x => x.Name.ToUpper() == identifier.ToUpper() && x.IsActive)
                .Take(2)
                .ToListAsync(cancellationToken);
            user = matches.Count == 1 ? matches[0] : null;
        }

        if (user is null ||
            hasher.VerifyHashedPassword(user, user.PasswordHash, password) == PasswordVerificationResult.Failed)
            return Unauthorized(new { message = "Usuário ou senha inválidos." });

        var isAdministrator = string.Equals(user.Role, "Administrador", StringComparison.OrdinalIgnoreCase);
        if ((portal == "admin") != isAdministrator)
            return Unauthorized(new
            {
                message = portal == "admin"
                    ? "Esta conta não possui acesso administrativo. Entre pelo Portal do Membro."
                    : "Esta conta pertence à administração. Entre pelo acesso administrativo."
            });

        return Ok(CreateSession(user));
    }

    [Authorize]
    [HttpPost("logout")]
    public IActionResult Logout() => NoContent();

    private AuthResponse CreateSession(AppUser user)
    {
        var key = Environment.GetEnvironmentVariable("JWT_KEY") ?? config["Jwt:Key"];
        if (string.IsNullOrWhiteSpace(key) || key.Length < 32)
            throw new InvalidOperationException("JWT_KEY não foi configurada corretamente.");

        var issuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? config["Jwt:Issuer"] ?? "ChurchManager.Api";
        var audience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? config["Jwt:Audience"] ?? "ChurchManager.Web";
        var isAdministrator = string.Equals(user.Role, "Administrador", StringComparison.OrdinalIgnoreCase);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, isAdministrator ? "Administrador" : "Membro"),
            new Claim("church_id", user.ChurchId.ToString())
        };

        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            notBefore: DateTime.UtcNow,
            expires: DateTime.UtcNow.AddMinutes(60),
            signingCredentials: credentials);

        var tokenValue = new JwtSecurityTokenHandler().WriteToken(token);
        return new AuthResponse(tokenValue, user.Name, user.Email, isAdministrator ? "Administrador" : "Membro");
    }
}

public sealed record RegisterRequest(
    [param: Required, StringLength(100, MinimumLength = 2)] string Name,
    [param: Required, EmailAddress, StringLength(254)] string Email,
    [param: Required, StringLength(128, MinimumLength = 8)] string Password,
    [param: Required, StringLength(100, MinimumLength = 2)] string ChurchName);

public sealed record LoginRequest(
    [param: Required, StringLength(254, MinimumLength = 1)] string Identifier,
    [param: Required, StringLength(128, MinimumLength = 1)] string Password,
    [param: StringLength(16)] string Portal = "admin");

public sealed record AuthResponse(string Token, string Name, string Email, string Role);
