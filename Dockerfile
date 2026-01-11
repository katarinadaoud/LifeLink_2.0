# ---------- BUILD STAGE (needs SDK) ----------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files first for better caching
COPY api/*.csproj ./api/
RUN dotnet restore ./api/*.csproj

# Copy the rest of the API source
COPY api/ ./api/

# Publish
RUN dotnet publish ./api/*.csproj -c Release -o /app/publish --no-restore

# ---------- RUNTIME STAGE ----------
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Create data directory for SQLite (optional but fine)
RUN mkdir -p /app/data

# Copy published output
COPY --from=build /app/publish ./

# Render (and many hosts) provide PORT env var. Default to 8080 if not set.
ENV ASPNETCORE_URLS=http://0.0.0.0:${PORT:-8080}

EXPOSE 8080

# Run the API
CMD ["dotnet", "api.dll"]
