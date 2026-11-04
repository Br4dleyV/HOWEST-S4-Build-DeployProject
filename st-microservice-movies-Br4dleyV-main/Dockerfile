FROM mcr.microsoft.com/dotnet/sdk:10.0 AS builder
WORKDIR /src

# Copy the entire solution
COPY . .

# Restore and publish the movies service
RUN dotnet restore "src/Howestprime.Movies.Main/Howestprime.Movies.Main.csproj"
RUN dotnet publish "src/Howestprime.Movies.Main/Howestprime.Movies.Main.csproj" \
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
ENV ASPNETCORE_URLS=http://+:8000
ENV ASPNETCORE_HTTP_PORT=8000

# Expose port
EXPOSE 8000

# Start the application
ENTRYPOINT ["dotnet", "Howestprime.Movies.Main.dll"]
