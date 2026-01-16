using Microsoft.EntityFrameworkCore;
using HomeCareApp.Data;
using Serilog;
using Serilog.Events;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.AspNetCore.Identity;
using HomeCareApp.Models;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.OpenApi.Models;
using HomeCareApp.Repositories.Interfaces;
using HomeCareApp.Repositories.Implementations;
using System.Security.Claims;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.HttpOverrides;

// Create the application builder (entry point for configuring services and middleware)
var builder = WebApplication.CreateBuilder(args);

// Add MVC-style controllers and configure JSON serialization
builder.Services.AddControllers().AddNewtonsoftJson(options =>
{
    options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
    
})
.ConfigureApiBehaviorOptions(options =>
{
    // Customize model validation error responses to return plain text messages
    options.InvalidModelStateResponseFactory = context =>
    {
        // Get the first error message from model state
        var firstError = context.ModelState.Values
            .SelectMany(v => v.Errors)
            .Select(e => e.ErrorMessage)
            .FirstOrDefault() ?? "Validation error occurred.";
        
        return new Microsoft.AspNetCore.Mvc.BadRequestObjectResult(firstError);
    };
});

// Register Swagger/OpenAPI for API documentation and testing
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    // Basic API info
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "HomeCare API", Version = "v1" }); // Basic info for the API

    // Describe how clients should pass JWT tokens in the Authorization header
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme // Define the Bearer auth scheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    // Require the Bearer token for protected endpoints in the Swagger UI
    c.AddSecurityRequirement(new OpenApiSecurityRequirement // Require Bearer token for accessing the API
    {{ new OpenApiSecurityScheme // Reference the defined scheme
            { Reference = new OpenApiReference
                { Type = ReferenceType.SecurityScheme,
                  Id = "Bearer"}},
            new string[] {}
        }});
});

// Register main application database context (domain data: patients, appointments, etc.)
builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseSqlite(builder.Configuration["ConnectionStrings:DefaultConnection"]);
});

// Register authentication/identity database context (users, roles, identity tables)
builder.Services.AddDbContext<AuthDbContext>(options =>
{
    options.UseSqlite(builder.Configuration["ConnectionStrings:AuthConnection"]);
});

// Configure ASP.NET Core Identity using AuthUser and the identity DbContext
builder.Services.AddIdentity<AuthUser, IdentityRole>(options =>
{
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.AllowedForNewUsers = true;
    // Demo password policy: strong but pragmatic
    options.Password.RequiredLength = 8;
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = false;
})
    .AddEntityFrameworkStores<AuthDbContext>()
    .AddDefaultTokenProviders();

// Configure CORS so the React frontends can talk to this API during development
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policyBuilder =>
    {
        // Read allowed origins from configuration.
        var originsCsv = builder.Configuration["Cors:AllowedOrigins"];
        var configuredOrigins = string.IsNullOrWhiteSpace(originsCsv)
            ? Array.Empty<string>()
            : originsCsv.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        // Allow either explicitly configured origins, or any *.vercel.app host when none provided.
        policyBuilder
            .SetIsOriginAllowed(origin =>
            {
                try
                {
                    var o = origin?.Trim();
                    if (string.IsNullOrEmpty(o)) return false;
                    if (configuredOrigins.Length > 0)
                        return configuredOrigins.Any(co => string.Equals(co, o, StringComparison.OrdinalIgnoreCase));
                    var host = new Uri(o).Host;
                    return host.EndsWith(".vercel.app", StringComparison.OrdinalIgnoreCase);
                }
                catch
                {
                    return false;
                }
            })
            .AllowAnyHeader()   // include all requested headers in preflight
            .AllowAnyMethod()   // includes OPTIONS for preflight
            .AllowCredentials();
    });
});

// Register repository services (dependency injection for data access layer)
builder.Services.AddScoped<IPatientRepository, PatientRepository>();
builder.Services.AddScoped<IAppointmentRepository, AppointmentRepository>();
builder.Services.AddScoped<IEmployeeRepository, EmployeeRepository>();
builder.Services.AddScoped<IMedicationRepository, MedicationRepository>();
builder.Services.AddScoped<INotificationRepository, NotificationRepository>();

// Add authorization services (will use policies/roles together with JWT)
builder.Services.AddAuthorization();

// Configure authentication to use JWT Bearer tokens
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.SaveToken = true;                  // Store the token in the authentication properties
    options.RequireHttpsMetadata = !builder.Environment.IsDevelopment();      // Require HTTPS in non-development environments
    options.TokenValidationParameters = new TokenValidationParameters()
    {
        ValidateIssuer = true,                 // Validate the token issuer
        ValidateAudience = true,               // Validate the token audience
        ValidateLifetime = true,               // Validate token expiry
        ValidateIssuerSigningKey = true,       // Validate the signing key
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
            builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT key not found in configuration.")
        )),
        // Preserve JWT claims without mapping
        NameClaimType = ClaimTypes.NameIdentifier,
        RoleClaimType = "role"
    };
});


// Clear default claims mapping to preserve JWT claims exactly as they appear in the token
JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();

// ProblemDetails for standardized error responses
builder.Services.AddProblemDetails();

// Rate limiting: protect login endpoint
builder.Services.AddRateLimiter(options =>
{
    options.AddPolicy("Login", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 5,
                Window = TimeSpan.FromMinutes(1),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0
            }));
    options.AddPolicy("Register", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 3,
                Window = TimeSpan.FromMinutes(1),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0
            }));
});

// Configure Serilog for file-based logging of the API
var loggerConfiguration = new LoggerConfiguration()
    .MinimumLevel.Information() // levels: Trace< Information < Warning < Erorr < Fatal
    .WriteTo.File($"APILogs/app_{DateTime.Now:yyyyMMdd_HHmmss}.log")
    // Filter out noisy EF Core information-level logs about executed SQL commands
    .Filter.ByExcluding(e => e.Properties.TryGetValue("SourceContext", out var value) &&
                            e.Level == LogEventLevel.Information &&
                            e.MessageTemplate.Text.Contains("Executed DbCommand"));
var logger = loggerConfiguration.CreateLogger();
builder.Logging.AddSerilog(logger);

// Build the configured application (services are now ready and pipeline can be set up)
var app = builder.Build();

// Ensure correct scheme/host behind proxies like Render
var forwarded = new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
};
forwarded.KnownNetworks.Clear();
forwarded.KnownProxies.Clear();
app.UseForwardedHeaders(forwarded);

// Development-only configuration: migrations, seeding and Swagger UI
if (app.Environment.IsDevelopment())
{
    // Run database migrations
    using (var scope = app.Services.CreateScope())
    {
        var appDbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var authDbContext = scope.ServiceProvider.GetRequiredService<AuthDbContext>();
        
        // Apply any pending migration
        await appDbContext.Database.MigrateAsync();
        await authDbContext.Database.MigrateAsync();
    }
    
    // Seed initial data (users, demo entities, etc.)
    await DBInit.Seed(app);

    // Enable Swagger UI for exploring the API in development
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Enforce HTTPS and HSTS in non-development environments
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
    app.UseHsts();
    // Basic CSP headers in production
    app.Use(async (context, next) =>
    {
        context.Response.Headers.TryAdd("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'");
        await next();
    });
}

// Serve static files (e.g. images, Swagger assets, etc.)
app.UseStaticFiles();

// Set up the HTTP request pipeline: routing, CORS, authentication, authorization, controllers
app.UseRouting();
app.UseCors("CorsPolicy");
app.UseRateLimiter();
app.UseExceptionHandler("/error");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Global error endpoint returning ProblemDetails
app.Map("/error", (HttpContext httpContext) => Results.Problem());


app.Run();
