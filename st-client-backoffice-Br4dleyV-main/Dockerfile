FROM mcr.microsoft.com/dotnet/sdk:10.0 AS builder
WORKDIR /src

# Copy the backoffice project and its dependencies
COPY Howestprime.Backoffice ./Howestprime.Backoffice
COPY Howestprime.Movies.ApiClient ./Howestprime.Movies.ApiClient

# Restore and publish the backoffice application
RUN dotnet restore "Howestprime.Backoffice/Howestprime.Backoffice.csproj"
RUN dotnet publish "Howestprime.Backoffice/Howestprime.Backoffice.csproj" \
    -c Release \
    -o /app/publish \
    -r linux-x64 \
    --self-contained false

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app

# Copy published application
COPY --from=builder /app/publish .

# Install curl for healthchecks
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables
ENV ASPNETCORE_ENVIRONMENT=Test
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_HTTP_PORT=8080

# Expose port
EXPOSE 8080

# Start the application
ENTRYPOINT ["dotnet", "Howestprime.Backoffice.dll"]
