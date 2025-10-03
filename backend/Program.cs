using backend.Models;
using backend.Services;
using backend.Mapping;
using Square;
using Square.Catalog;
using Supabase;

var builder = WebApplication.CreateBuilder(args);

// Square API
// Pull settings (make sure you stored them with dotnet user-secrets or env vars)
var accessToken = builder.Configuration["Square:AccessToken"]
    ?? throw new InvalidOperationException("Square:AccessToken is missing.");
var environment = builder.Configuration["Square:Environment"] ?? "sandbox";

// Supabase API
var supabaseUrl = builder.Configuration["Supabase:Url"]
    ?? throw new InvalidOperationException("Supabase:Url is missing.");
var supabaseKey = builder.Configuration["Supabase:Key"]
    ?? throw new InvalidOperationException("Supabase:Key is missing.");

// AutoMapper
builder.Services.AddAutoMapper(typeof(AutoMapperProfile));
builder.Services.AddScoped<ISupabaseService, SupabaseService>();

// Register minimal services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Register the Square client so you can inject it later
builder.Services.AddSingleton(_ => new SquareClient(
    token: accessToken,
    clientOptions: new ClientOptions
    {
        BaseUrl = environment.Equals("production", StringComparison.OrdinalIgnoreCase)
            ? SquareEnvironment.Production
            : SquareEnvironment.Sandbox
    }));

// Register the Supabase client
builder.Services.AddSingleton<Client>(sp =>
{
    var client = new Client(supabaseUrl, supabaseKey);
    client.InitializeAsync().Wait(); // blocking init, fine for startup
    return client;
});

var app = builder.Build();

//app.UseHttpsRedirection();
app.MapControllers();

await RunSquareSmokeTestAsync(app.Services);
await RunSupabaseSmokeTestAsync(app.Services);

if(app.Environment.IsDevelopment()){
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "BYTE2BITE API V1");
        options.RoutePrefix = "swagger";
    });
}

await app.RunAsync();

static async Task RunSquareSmokeTestAsync(IServiceProvider services)
{
    await using var scope = services.CreateAsyncScope();
    var client = scope.ServiceProvider.GetRequiredService<SquareClient>();

    try
    {
        var pager = await client.Catalog.ListAsync(new ListCatalogRequest());
        var printed = false;

        Console.WriteLine("Square catalog items:");

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

            var name = item.ItemData?.Name;
            if (!string.IsNullOrWhiteSpace(name))
            {
                Console.WriteLine($"- {name}");
                printed = true;
            }
        }

        if (!printed)
        {
            Console.WriteLine("Square catalog list succeeded but no item names were found.");
        }
    }
    catch (SquareApiException ex)
    {
        Console.WriteLine($"Square catalog list failed: {ex.Message}");
    }
}

static async Task RunSupabaseSmokeTestAsync(IServiceProvider services)
{
    await using var scope = services.CreateAsyncScope();
    var client = scope.ServiceProvider.GetRequiredService<Client>();

    try
    {
        // Just a basic call to ensure Supabase connection works
        var response = await client.From<Ingredient>().Get();
        Console.WriteLine($"Supabase connected, retrieved {response.Models.Count} row(s).");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Supabase test failed: {ex.Message}");
    }
}
