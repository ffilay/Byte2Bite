using Microsoft.Extensions.DependencyInjection;
using Square;
using Square.Catalog;

var builder = WebApplication.CreateBuilder(args);

// Pull settings (make sure you stored them with dotnet user-secrets or env vars)
var accessToken = builder.Configuration["Square:AccessToken"]
    ?? throw new InvalidOperationException("Square:AccessToken is missing.");
var environment = builder.Configuration["Square:Environment"] ?? "sandbox";

// Register minimal services
builder.Services.AddControllers();

// Register the Square client so you can inject it later
builder.Services.AddSingleton(_ => new SquareClient(
    token: accessToken,
    clientOptions: new ClientOptions
    {
        BaseUrl = environment.Equals("production", StringComparison.OrdinalIgnoreCase)
            ? SquareEnvironment.Production
            : SquareEnvironment.Sandbox
    }));

var app = builder.Build();

app.UseHttpsRedirection();
app.MapControllers();

await RunSquareSmokeTestAsync(app.Services);

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
