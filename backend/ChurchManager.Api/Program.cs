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

var builder = WebApplication.CreateBuilder(args);
// O sistema não recebe arquivos; limite global de JSON evita cargas excessivas.
builder.WebHost.ConfigureKestrel(options => options.Limits.MaxRequestBodySize = 1_048_576);
var connectionString = Environment.GetEnvironmentVariable("CHURCHMANAGER_DB")
    ?? builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Server=localhost;Port=3307;Database=churchmanager;User=churchmanager;Password=churchmanager_local_dev;";
var databaseProvider = Environment.GetEnvironmentVariable("DATABASE_PROVIDER")
    ?? builder.Configuration["Database:Provider"]
    ?? "MySql";
var jwtKey = Environment.GetEnvironmentVariable("JWT_KEY") ?? builder.Configuration["Jwt:Key"] ?? "";
var jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? builder.Configuration["Jwt:Issuer"] ?? "ChurchManager.Api";
var jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? builder.Configuration["Jwt:Audience"] ?? "ChurchManager.Web";
var configuredFrontend = Environment.GetEnvironmentVariable("FRONTEND_ORIGIN") ?? builder.Configuration["FRONTEND_ORIGIN"];

if (jwtKey.Length < 32 || (!builder.Environment.IsDevelopment() && jwtKey.StartsWith("local-dev-only", StringComparison.Ordinal)))
    throw new InvalidOperationException("Configure JWT_KEY com pelo menos 32 caracteres aleatórios e exclusivos antes de iniciar a API.");
if (!builder.Environment.IsDevelopment())
{
    if (string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")) && string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("CHURCHMANAGER_DB")))
        throw new InvalidOperationException("Configure ConnectionStrings__DefaultConnection ou CHURCHMANAGER_DB com a conexão do banco remoto.");
    if (!Uri.TryCreate(configuredFrontend, UriKind.Absolute, out var frontendUri) || frontendUri.Scheme != Uri.UriSchemeHttps)
        throw new InvalidOperationException("Configure FRONTEND_ORIGIN com a origem HTTPS exata do front-end publicado.");
}

builder.Services.AddDbContext<AppDbContext>(options =>
{
    if (databaseProvider.Equals("PostgreSQL", StringComparison.OrdinalIgnoreCase) ||
        databaseProvider.Equals("Postgres", StringComparison.OrdinalIgnoreCase))
    {
        options.UseNpgsql(connectionString);
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
app.MapControllers();

// Opt-in explícito para preparar o esquema em uma demonstração/homologação.
// Para produção real, substituir EnsureCreated por migrações EF Core revisadas.
var autoCreateDatabase = app.Configuration.GetValue<bool>("Database:AutoCreate") ||
    string.Equals(Environment.GetEnvironmentVariable("DATABASE_AUTO_CREATE"), "true", StringComparison.OrdinalIgnoreCase);
if (autoCreateDatabase)
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.EnsureCreatedAsync();
}
app.Run();
