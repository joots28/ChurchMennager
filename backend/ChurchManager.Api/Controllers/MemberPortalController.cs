using System.Security.Claims;
using System.Text.Json;
using ChurchManager.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ChurchManager.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/member")]
public sealed class MemberPortalController(AppDbContext db) : ControllerBase
{
    private int? CurrentChurchId =>
        int.TryParse(User.FindFirstValue("church_id"), out var id) ? id : null;

    [HttpGet("events")]
    public async Task<IActionResult> GetEvents(CancellationToken cancellationToken)
    {
        if (CurrentChurchId is not int churchId) return Unauthorized();

        var events = await db.Events.AsNoTracking()
            .Where(x => x.ChurchId == churchId && !x.IsRestricted)
            .OrderBy(x => x.StartsAt)
            .ToListAsync(cancellationToken);

        return Ok(events.Select(x => new
        {
            id = x.Id,
            title = x.Title,
            description = x.Description,
            date = x.StartsAt.ToString("yyyy-MM-dd"),
            time = x.StartsAt.ToString("HH:mm"),
            location = x.Location,
            ministry = x.Ministry,
            status = x.Status
        }));
    }

    [HttpGet("scales")]
    public async Task<IActionResult> GetScales(CancellationToken cancellationToken)
    {
        if (CurrentChurchId is not int churchId) return Unauthorized();

        var currentName = User.FindFirstValue(ClaimTypes.Name) ?? string.Empty;
        if (string.IsNullOrWhiteSpace(currentName)) return Unauthorized();

        var scales = await db.Scales.AsNoTracking()
            .Where(x => x.ChurchId == churchId)
            .OrderBy(x => x.StartsAt)
            .ToListAsync(cancellationToken);

        return Ok(scales
            .Select(x => new { Scale = x, Members = ParseMembers(x.AssignedMembersJson) })
            .Where(x => x.Members.Any(name => string.Equals(name, currentName, StringComparison.OrdinalIgnoreCase)))
            .Select(x => new
            {
                id = x.Scale.Id,
                title = x.Scale.Title,
                ministry = x.Scale.Ministry,
                date = x.Scale.StartsAt.ToString("yyyy-MM-dd"),
                time = x.Scale.StartsAt.ToString("HH:mm"),
                status = x.Scale.Status,
                members = string.Join(", ", x.Members)
            }));
    }

    [HttpGet("settings")]
    public async Task<IActionResult> GetSettings(CancellationToken cancellationToken)
    {
        if (CurrentChurchId is not int churchId) return Unauthorized();

        var church = await db.Churches.AsNoTracking()
            .SingleOrDefaultAsync(x => x.Id == churchId, cancellationToken);

        return church is null
            ? NotFound()
            : Ok(new
            {
                churchName = church.Name,
                email = church.Email,
                phone = church.Phone,
                address = church.Address
            });
    }

    private static List<string> ParseMembers(string? json)
    {
        try
        {
            return JsonSerializer.Deserialize<List<string>>(string.IsNullOrWhiteSpace(json) ? "[]" : json)
                ?? new List<string>();
        }
        catch (JsonException)
        {
            return new List<string>();
        }
    }
}
