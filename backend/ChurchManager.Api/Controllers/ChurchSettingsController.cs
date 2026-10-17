using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using ChurchManager.Api.Data;
using ChurchManager.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ChurchManager.Api.Controllers;

[ApiController]
[Authorize(Roles = "Administrador")]
[Route("api/church/settings")]
public sealed class ChurchSettingsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        if (!int.TryParse(User.FindFirstValue("church_id"), out var churchId)) return Unauthorized();
        var church = await db.Churches.AsNoTracking().SingleOrDefaultAsync(x => x.Id == churchId);
        return church is null ? NotFound() : Ok(new { churchName = church.Name, email = church.Email, phone = church.Phone, address = church.Address });
    }

    [HttpPut]
    public async Task<IActionResult> Update(ChurchSettingsRequest request)
    {
        if (!int.TryParse(User.FindFirstValue("church_id"), out var churchId)) return Unauthorized();
        var name = request?.ChurchName?.Trim() ?? string.Empty;
        var email = request?.Email?.Trim().ToLowerInvariant() ?? string.Empty;
        var phone = request?.Phone?.Trim() ?? string.Empty;
        var address = request?.Address?.Trim() ?? string.Empty;
        if (name.Length is < 2 or > 180)
            return BadRequest(new { message = "Informe o nome da igreja com 2 a 180 caracteres." });
        if (email.Length > 254 || !new EmailAddressAttribute().IsValid(email))
            return BadRequest(new { message = "Informe um e-mail institucional válido." });
        if (phone.Length > 40 || address.Length > 250)
            return BadRequest(new { message = "Telefone deve ter até 40 caracteres e endereço até 250 caracteres." });
        var church = await db.Churches.SingleOrDefaultAsync(x => x.Id == churchId);
        if (church is null) return NotFound();
        church.Name = name; church.Email = email; church.Phone = phone; church.Address = address;
        await db.SaveChangesAsync();
        return Ok(new { churchName = church.Name, email = church.Email, phone = church.Phone, address = church.Address });
    }
}
