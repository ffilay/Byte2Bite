using backend.Models;
using backend.Services;
using backend.Mapping;
using Square;
using Square.Catalog;
using Supabase;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Security.Cryptography;

var builder = WebApplication.CreateBuilder(args);

// Square API
// Pull settings (make sure you stored them with dotnet user-secrets or env vars)
var accessToken = builder.Configuration["Square:AccessToken"]
    ?? throw new InvalidOperationException("Square:AccessToken is missing.");
var environment = builder.Configuration["Square:Environment"] ?? "sandbox";

// Supabase API
var supabaseUrl = builder.Configuration["Supabase:Url"]
    ?? throw new InvalidOperationException("Supabase:Url is missing.");
var supabaseAnonKey = builder.Configuration["Supabase:AnonKey"]
    ?? throw new InvalidOperationException("Supabase:AnonKey is missing.");
var supabaseServiceKey = builder.Configuration["Supabase:ServiceKey"]
    ?? throw new InvalidOperationException("Supabase:ServiceKey is missing.");

// AutoMapper
builder.Services.AddAutoMapper(typeof(AutoMapperProfile));

builder.Services.AddScoped<ISupabaseService, SupabaseService>();
builder.Services.AddScoped<ISquareMenuSyncService, SquareMenuSyncService>();
builder.Services.AddScoped<ISquareOrderSyncService, SquareOrderSyncService>();
builder.Services.AddHostedService<SquareOrderSyncBackgroundService>();
builder.Services.AddSingleton(_ => new SquareClient(
    token: accessToken,
    clientOptions: new ClientOptions
    {
        BaseUrl = environment.Equals("production", StringComparison.OrdinalIgnoreCase)
            ? SquareEnvironment.Production
            : SquareEnvironment.Sandbox
    }));
// Register minimal services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.MetadataAddress = $"{supabaseUrl}/auth/v1/.well-known/jwks.json";
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = false,
            ValidIssuer = supabaseUrl
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy
            .WithOrigins("http://localhost:8081") 
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors("AllowReactApp");
app.UseAuthentication();
app.UseAuthorization();
app.UseHttpsRedirection();
app.MapControllers();

using var startupCts = new CancellationTokenSource(TimeSpan.FromSeconds(10));
await RunSupabaseSmokeTestAsync(app.Services, startupCts.Token);
await RunSquareSmokeTestAsync(app.Services);

if(app.Environment.IsDevelopment()){
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "BYTE2BITE API V1");
        options.RoutePrefix = "swagger";
    });
}

// Run Square → Supabase menu sync at startup (before the server blocks)
var restaurantId = 1; // TODO: replace with your real restaurant id or config
await using (var syncScope = app.Services.CreateAsyncScope())
{
    var sync = syncScope.ServiceProvider.GetRequiredService<ISquareMenuSyncService>();
    try
    {
        using var syncCts = new CancellationTokenSource(TimeSpan.FromSeconds(15));
        var upserted = await sync.ImportMenuItemsAsync(restaurantId, syncCts.Token);
        Console.WriteLine($"Square sync completed: {upserted} item(s) upserted for restaurant {restaurantId}.");
    }
    catch (OperationCanceledException)
    {
        Console.WriteLine("Square menu sync startup skipped due to timeout.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Square menu sync startup failed: {ex.Message}");
    }
}

await app.RunAsync();
static async Task RunSquareSmokeTestAsync(IServiceProvider services)
{
    await using var scope = services.CreateAsyncScope();
    var client = scope.ServiceProvider.GetRequiredService<SquareClient>();
    int count = 0;

    try
    {
        var pager = await client.Catalog.ListAsync(new ListCatalogRequest());

        await foreach (var catalogObject in pager)
        {
            if (!catalogObject.TryAsItem(out var item))
            {
                continue;
            }

            if (item is null)
            {
                continue;
            }

            count +=1;
        }

        Console.WriteLine(count + " item(s) found in Square");
    }
    catch (SquareApiException ex)
    {
        Console.WriteLine($"Square catalog list failed: {ex.Message}");
    }
}

static async Task RunSupabaseSmokeTestAsync(IServiceProvider services, CancellationToken cancellationToken = default)
{
    await using var scope = services.CreateAsyncScope();
    var supabaseService = scope.ServiceProvider.GetRequiredService<ISupabaseService>();
    var client = supabaseService.Client;

    try
    {
        // Just a basic call to ensure Supabase connection works
        var response = await client.From<Ingredient>().Get(cancellationToken: cancellationToken);
        Console.WriteLine($"Supabase connected, retrieved {response.Models.Count} row(s).");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Supabase test failed: {ex.Message}");
    }
}
