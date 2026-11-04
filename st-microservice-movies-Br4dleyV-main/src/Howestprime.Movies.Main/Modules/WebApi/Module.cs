using Microsoft.OpenApi;
using Howestprime.Movies.Infrastructure.WebApi;
using Howestprime.Movies.Infrastructure.WebApi.Shared;

namespace Howestprime.Movies.Main.Modules.WebApi;

public static class WebApiModule
{
    public static IServiceCollection AddWebApiModule(
        this IServiceCollection services,
        IConfiguration configuration
    )
    {
        services.AddHealthChecks();
        services.AddExceptionHandler<GlobalExceptionHandler>();
        services.AddProblemDetails();
        services.AddCors(options =>
        {
            options.AddDefaultPolicy(builder =>
            {
                builder
                    .WithExposedHeaders("*")
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowAnyOrigin();
            });
        });

        services.AddOpenApi(options =>
        {
            options.AddDocumentTransformer((document, context, cancellationToken) =>
            {
                document.Info.Title = configuration["WebApi:Title"];
                document.Info.Version = configuration["WebApi:Version"];
                document.Info.Description = configuration["WebApi:Description"];
                document.Info.Contact = new OpenApiContact
                {
                    Name = configuration["WebApi:Contact:Name"],
                    Email = configuration["WebApi:Contact:Email"]
                };
                return Task.CompletedTask;
            });
        });
        services.AddWebApiValidation();

        return services;
    }

    public static WebApplication UseWebApiModule(this WebApplication app)
    {
        app.UseExceptionHandler();
        app.UseCors();

        string specificationName = (app.Configuration["WebApi:Version"] ?? "v1")
            + (app.Configuration["WebApi:Format"] ?? ".yaml");

        string specificationPath = app.Configuration["WebApi:Url"] ?? "/openapi/";

        string specificationFullPath = specificationPath + specificationName;

        app.MapOpenApi(specificationFullPath);
        
        if (!app.Environment.IsProduction())
        {
            app.UseSwaggerUI(options => options.SwaggerEndpoint(specificationFullPath, specificationName));
            app.UseHttpsRedirection();
        }

        app.MapHealthChecks("/health");
        app.MapRoutes();

        return app;
    }
}