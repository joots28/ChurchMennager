using System.Text;
using System.Threading.RateLimiting;
using ChurchManager.Api.Data;
using ChurchManager.Api.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);
// O sistema não recebe arquivos; limite global de JSON evita cargas excessivas.
builder.WebHost.ConfigureKestrel(options => options.Limits.MaxRequestBodySize = 1_048_576);

var databaseProvider = (
    Environment.GetEnvironmentVariable("CHURCHMANAGER_DB_PROVIDER")
    ?? builder.Configuration["Database:Provider"]
    ?? "mysql").Trim();

var connectionString = Environment.GetEnvironmentVariable("CHURCHMANAGER_DB")
    ?? builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Server=localhost;Port=3307;Database=churchmanager;User=churchmanager;Password=churchmanager_local_dev;";

var usesPostgres = databaseProvider.Equals("postgres", StringComparison.OrdinalIgnoreCase)
    || databaseProvider.Equals("postgresql", StringComparison.OrdinalIgnoreCase);
var usesMySql = databaseProvider.Equals("mysql", StringComparison.OrdinalIgnoreCase);

if (!usesPostgres && !usesMySql)
    throw new InvalidOperationException("CHURCHMANAGER_DB_PROVIDER deve ser 'mysql' ou 'postgres'.");

var jwtKey = Environment.GetEnvironmentVariable("JWT_KEY") ?? builder.Configuration["Jwt:Key"] ?? "";
var jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? builder.Configuration["Jwt:Issuer"] ?? "ChurchManager.Api";
var jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? builder.Configuration["Jwt:Audience"] ?? "ChurchManager.Web";
var configuredFrontend = Environment.GetEnvironmentVariable("FRONTEND_ORIGIN") ?? builder.Configuration["FRONTEND_ORIGIN"];

if (jwtKey.Length < 32 || (!builder.Environment.IsDevelopment() && jwtKey.StartsWith("local-dev-only", StringComparison.Ordinal)))
    throw new InvalidOperationException("Configure JWT_KEY com pelo menos 32 caracteres aleatórios e exclusivos antes de iniciar a API.");

if (!builder.Environment.IsDevelopment())
{
    if (string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection"))
        && string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("CHURCHMANAGER_DB")))
        throw new InvalidOperationException("Configure ConnectionStrings__DefaultConnection ou CHURCHMANAGER_DB com a conexão do banco remoto.");

    if (!Uri.TryCreate(configuredFrontend, UriKind.Absolute, out var frontendUri)
        || frontendUri.Scheme != Uri.UriSchemeHttps)
        throw new InvalidOperationException("Configure FRONTEND_ORIGIN com a origem HTTPS exata do front-end publicado.");
}

builder.Services.AddDbContext<AppDbContext>(options =>
{
    if (usesPostgres)
    {
        var postgresConnectionString = PreparePostgresConnectionString(
            connectionString,
            requireSsl: !builder.Environment.IsDevelopment());

        options.UseNpgsql(postgresConnectionString);
    }
    else
    {
        options.UseMySql(connectionString, new MySqlServerVersion(new Version(8, 0, 36)));
    }
});

builder.Services.AddScoped<IPasswordHasher<AppUser>, PasswordHasher<AppUser>>();
builder.Services.AddControllers();
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = _ => new BadRequestObjectResult(new
    {
        message = "Confira os campos obrigatórios e os formatos informados."
    });
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var originCandidates = builder.Environment.IsDevelopment()
    ? new[] { "http://localhost:5173", "http://127.0.0.1:5173", configuredFrontend }
    : new[] { configuredFrontend };
var allowedOrigins = originCandidates.Where(x => !string.IsNullOrWhiteSpace(x))
    .Cast<string>().Distinct(StringComparer.OrdinalIgnoreCase).ToArray();

builder.Services.AddCors(options => options.AddPolicy("Frontend", policy => policy
    .WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod()));

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("Auth", context => RateLimitPartition.GetFixedWindowLimiter(
        partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown-client",
        factory: _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 12,
            Window = TimeSpan.FromMinutes(1),
            QueueLimit = 0,
            AutoReplenishment = true
        }));
    options.AddPolicy("Login", context => RateLimitPartition.GetFixedWindowLimiter(
        partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown-client",
        factory: _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 5,
            Window = TimeSpan.FromMinutes(5),
            QueueLimit = 0,
            AutoReplenishment = true
        }));
});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
{
    options.MapInboundClaims = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ValidateLifetime = true,
        RequireExpirationTime = true,
        RequireSignedTokens = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ClockSkew = TimeSpan.FromSeconds(15)
    };
});
builder.Services.AddAuthorization();

var app = builder.Build();
app.UseExceptionHandler(errorApp => errorApp.Run(async context =>
{
    context.Response.StatusCode = StatusCodes.Status500InternalServerError;
    context.Response.ContentType = "application/json";
    await context.Response.WriteAsJsonAsync(new { message = "Ocorreu um erro inesperado. Tente novamente mais tarde." });
}));
app.Use(async (context, next) =>
{
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["X-Frame-Options"] = "DENY";
    context.Response.Headers["Referrer-Policy"] = "no-referrer";
    context.Response.Headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()";
    if (!app.Environment.IsDevelopment()) context.Response.Headers["Strict-Transport-Security"] = "max-age=31536000";
    if (context.Request.Path.StartsWithSegments("/api"))
    {
        context.Response.Headers["Cache-Control"] = "no-store, max-age=0";
        context.Response.Headers["Pragma"] = "no-cache";
    }
    await next();
});
if (!app.Environment.IsDevelopment()) app.UseHsts();
app.UseRouting();
app.UseCors("Frontend");
app.UseRateLimiter();
if (app.Environment.IsDevelopment()) { app.UseSwagger(); app.UseSwaggerUI(); }
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/health", () => Results.Ok(new { status = "ok", service = "ChurchManager API" }));
app.MapGet("/health/ready", async (AppDbContext db, CancellationToken cancellationToken) =>
{
    try
    {
        var connected = await db.Database.CanConnectAsync(cancellationToken);
        IResult result = connected
            ? Results.Ok(new { status = "ok", database = "connected" })
            : Results.Json(new { status = "error", database = "unavailable" }, statusCode: StatusCodes.Status503ServiceUnavailable);
        return result;
    }
    catch
    {
        return Results.Json(new { status = "error", database = "unavailable" }, statusCode: StatusCodes.Status503ServiceUnavailable);
    }
});
app.MapControllers();

// EnsureCreated is intended only for a new/empty database bootstrap.
// Use a reviewed EF migration for future schema changes; EnsureCreated does not update existing tables.
if (app.Configuration.GetValue<bool>("Database:AutoCreate"))
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.EnsureCreatedAsync();
}
app.Run();

static string PreparePostgresConnectionString(string value, bool requireSsl)
{
    // Render supplies a PostgreSQL URL; Npgsql expects a keyword/value connection string.
    if (Uri.TryCreate(value, UriKind.Absolute, out var uri)
        && (uri.Scheme.Equals("postgres", StringComparison.OrdinalIgnoreCase)
            || uri.Scheme.Equals("postgresql", StringComparison.OrdinalIgnoreCase)))
    {
        var userInfo = uri.UserInfo.Split(':', 2);
        var database = Uri.UnescapeDataString(uri.AbsolutePath.Trim('/'));
        if (userInfo.Length != 2 || string.IsNullOrWhiteSpace(database))
            throw new InvalidOperationException("A URL de conexão PostgreSQL está incompleta.");

        var parsedUri = new NpgsqlConnectionStringBuilder
        {
            Host = uri.Host,
            Port = uri.Port > 0 ? uri.Port : 5432,
            Database = database,
            Username = Uri.UnescapeDataString(userInfo[0]),
            Password = Uri.UnescapeDataString(userInfo[1]),
            SslMode = requireSsl ? SslMode.Require : SslMode.Prefer,
            Timeout = 15,
            CommandTimeout = 30,
            ApplicationName = "ChurchManager.Api"
        };
        return parsedUri.ConnectionString;
    }

    var parsed = new NpgsqlConnectionStringBuilder(value);
    if (requireSsl) parsed.SslMode = SslMode.Require;
    if (string.IsNullOrWhiteSpace(parsed.ApplicationName)) parsed.ApplicationName = "ChurchManager.Api";
    return parsed.ConnectionString;
}
