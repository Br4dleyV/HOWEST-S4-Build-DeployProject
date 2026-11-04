using Howestprime.Backoffice.Components;
using global::Howestprime.Movies.ApiClient.DependencyInjection;
using Howestprime.Backoffice.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();

builder.Services.AddHowestprimeMoviesApiClient(builder.Configuration.GetSection("MoviesApi"));

var app = builder.Build();
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error", createScopeForErrors: true);
    app.UseHsts();
}

// Don't use HTTPS redirection when running in Azure App Service
// Azure handles HTTPS at the load balancer level
if (app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseStaticFiles();
app.UseAntiforgery();

app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode();

app.Run();
