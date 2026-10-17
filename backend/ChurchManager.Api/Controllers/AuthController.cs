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
public sealed class AuthController(AppDbContext db, IConfiguration config, IPasswordHasher<AppUser> hasher, IWebHostEnvironment environment) : ControllerBase
{
    [AllowAnonymous]
    [EnableRateLimiting("Auth")]
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request, CancellationToken cancellationToken)
    {
        var allowPublicRegistration = bool.TryParse(Environment.GetEnvironmentVariable("AUTH_ALLOW_PUBLIC_REGISTRATION"), out var environmentSetting)
            ? environmentSetting
            : config.GetValue<bool>("Auth:AllowPublicRegistration");
        if (!environment.IsDevelopment() && !allowPublicRegistration)
            return StatusCode(StatusCodes.Status403Forbidden, new { message = "O cadastro público está desativado nesta instalação. Solicite acesso ao administrador do sistema." });

        var name = request.Name?.Trim() ?? string.Empty;
        var email = request.Email?.Trim().ToLowerInvariant() ?? string.Empty;
        var churchName = request.ChurchName?.Trim() ?? string.Empty;
        if (name.Length is < 2 or > 160 || churchName.Length is < 2 or > 180 || email.Length > 254 || !new EmailAddressAttribute().IsValid(email))
            return BadRequest(new { message = "Informe nome, e-mail válido e nome da igreja dentro dos limites indicados." });
        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 12 || request.Password.Length > 128)
            return BadRequest(new { message = "A senha deve ter entre 12 e 128 caracteres." });

        if (await db.Users.AnyAsync(x => x.Email == email, cancellationToken))
            return Conflict(new { message = "Não foi possível concluir o cadastro com esse e-mail. Confira os dados ou entre na conta existente." });

        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            var church = new Church { Name = churchName, Email = email };
            db.Churches.Add(church);
            await db.SaveChangesAsync(cancellationToken);
            var user = new AppUser { ChurchId = church.Id, Name = name, Email = email, Role = "Administrador" };
            user.PasswordHash = hasher.HashPassword(user, request.Password);
            db.Users.Add(user);
            await db.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
            return Ok(ToResponse(user));
        }
        catch (DbUpdateException)
        {
            await transaction.RollbackAsync(cancellationToken);
            return Conflict(new { message = "Não foi possível concluir o cadastro com esse e-mail. Confira os dados ou entre na conta existente." });
        }
    }

    [AllowAnonymous]
    [EnableRateLimiting("Login")]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        var identifier = request.Identifier?.Trim() ?? string.Empty;
        var password = request.Password ?? string.Empty;
        if (identifier.Length is 0 or > 254 || password.Length is 0 or > 128)
            return BadRequest(new { message = "Informe um usuário/e-mail e uma senha válidos." });

        AppUser? user;
        if (identifier.Contains('@'))
        {
            var email = identifier.ToLowerInvariant();
            user = await db.Users.SingleOrDefaultAsync(x => x.Email == email, cancellationToken);
        }
        else
        {
            // Nome não é necessariamente único: só autentica se houver exatamente uma correspondência.
            var matches = await db.Users
                .Where(x => x.Name.ToUpper() == identifier.ToUpper())
                .Take(2)
                .ToListAsync(cancellationToken);
            user = matches.Count == 1 ? matches[0] : null;
        }
        if (user is null) return Unauthorized(new { message = "Usuário ou senha inválidos." });
        var verification = hasher.VerifyHashedPassword(user, user.PasswordHash, password);
        if (verification == PasswordVerificationResult.Failed)
            return Unauthorized(new { message = "Usuário ou senha inválidos." });
        if (verification == PasswordVerificationResult.SuccessRehashNeeded)
        {
            user.PasswordHash = hasher.HashPassword(user, password);
            await db.SaveChangesAsync(cancellationToken);
        }
        return Ok(ToResponse(user));
    }

    private AuthResponse ToResponse(AppUser user)
    {
        // A mesma variável de ambiente usada para validar o JWT é prioritária também para assiná-lo.
        var key = Environment.GetEnvironmentVariable("JWT_KEY") ?? config["Jwt:Key"];
        if (string.IsNullOrWhiteSpace(key) || key.Length < 32)
            throw new InvalidOperationException("JWT_KEY não foi configurada corretamente.");
        var issuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? config["Jwt:Issuer"] ?? "ChurchManager.Api";
        var audience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? config["Jwt:Audience"] ?? "ChurchManager.Web";
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim("church_id", user.ChurchId.ToString())
        };
        var credentials = new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)), SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(issuer: issuer, audience: audience, claims: claims,
            notBefore: DateTime.UtcNow, expires: DateTime.UtcNow.AddMinutes(60), signingCredentials: credentials);
        return new AuthResponse(new JwtSecurityTokenHandler().WriteToken(token), user.Name, user.Email, user.Role);
    }
}

public sealed record RegisterRequest(
    [property: Required, StringLength(160, MinimumLength = 2)] string Name,
    [property: Required, EmailAddress, StringLength(254)] string Email,
    [property: Required, StringLength(128, MinimumLength = 12)] string Password,
    [property: Required, StringLength(180, MinimumLength = 2)] string ChurchName);

public sealed record LoginRequest(
    [property: Required, StringLength(254, MinimumLength = 1)] string Identifier,
    [property: Required, StringLength(128, MinimumLength = 1)] string Password);
