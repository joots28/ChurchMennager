using System.Security.Claims;
using ChurchManager.Api.Data;
using ChurchManager.Api.Models;
using ChurchManager.Api.Validation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ChurchManager.Api.Controllers;

[ApiController]
[Authorize(Roles = "Administrador")]
public abstract class ChurchCrudController<T>(AppDbContext db) : ControllerBase where T : class, IChurchOwnedEntity, new()
{
    protected AppDbContext Db { get; } = db;
    private int? CurrentChurchId => int.TryParse(User.FindFirstValue("church_id"), out var id) ? id : null;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        if (CurrentChurchId is not int churchId) return Unauthorized();
        var list = await Db.Set<T>().AsNoTracking().Where(x => x.ChurchId == churchId).OrderByDescending(x => x.Id).ToListAsync();
        return Ok(list);
    }
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        if (CurrentChurchId is not int churchId) return Unauthorized();
        var item = await Db.Set<T>().AsNoTracking().FirstOrDefaultAsync(x => x.Id == id && x.ChurchId == churchId);
        return item is null ? NotFound() : Ok(item);
    }
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] T item)
    {
        if (CurrentChurchId is not int churchId) return Unauthorized();
        ChurchEntityValidator.Normalize(item);
        if (ChurchEntityValidator.Validate(item) is { } validationError)
            return BadRequest(new { message = validationError });
        item.Id = 0; item.ChurchId = churchId; item.CreatedAt = DateTime.UtcNow;
        if (item is ChurchRole newRole) newRole.Users = 0;
        Db.Set<T>().Add(item); await Db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
    }
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] T input)
    {
        if (CurrentChurchId is not int churchId) return Unauthorized();
        var current = await Db.Set<T>().FirstOrDefaultAsync(x => x.Id == id && x.ChurchId == churchId);
        if (current is null) return NotFound();
        ChurchEntityValidator.Normalize(input);
        if (ChurchEntityValidator.Validate(input) is { } validationError)
            return BadRequest(new { message = validationError });
        var createdAt = current.CreatedAt;
        if (input is ChurchRole incomingRole && current is ChurchRole existingRole)
            incomingRole.Users = existingRole.Users; // esse contador não é definido pelo navegador
        Db.Entry(current).CurrentValues.SetValues(input);
        current.Id = id; current.ChurchId = churchId; current.CreatedAt = createdAt;
        await Db.SaveChangesAsync();
        return Ok(current);
    }
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        if (CurrentChurchId is not int churchId) return Unauthorized();
        var current = await Db.Set<T>().FirstOrDefaultAsync(x => x.Id == id && x.ChurchId == churchId);
        if (current is null) return NotFound();
        Db.Remove(current); await Db.SaveChangesAsync(); return NoContent();
    }
}

[Route("api/members")] public sealed class MembersController(AppDbContext db) : ChurchCrudController<Member>(db) { }
[Route("api/ministries")] public sealed class MinistriesController(AppDbContext db) : ChurchCrudController<Ministry>(db) { }
[Route("api/events")] public sealed class EventsController(AppDbContext db) : ChurchCrudController<ChurchEvent>(db) { }
[Route("api/transactions")] public sealed class TransactionsController(AppDbContext db) : ChurchCrudController<FinanceTransaction>(db) { }
[Route("api/roles")] public sealed class RolesController(AppDbContext db) : ChurchCrudController<ChurchRole>(db) { }
[Route("api/scales")] public sealed class ScalesController(AppDbContext db) : ChurchCrudController<ChurchScale>(db) { }