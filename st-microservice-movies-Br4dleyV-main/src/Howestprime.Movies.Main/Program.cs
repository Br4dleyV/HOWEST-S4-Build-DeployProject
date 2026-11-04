using Howestprime.Movies.Infrastructure.WebApi;
using Howestprime.Movies.Main.Modules;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddModules(builder.Configuration);

builder.Services.AddOpenApi(); // Add OpenAPI/ScalarUI support

WebApplication app = await builder.Build().UseModules();

if (app.Environment.IsDevelopment())
{
    // Map Scalar
    app.MapOpenApi();
    app.MapScalarApiReference();
}

await app.RunAsync();
