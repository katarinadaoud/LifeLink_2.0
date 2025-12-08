# Use the official .NET runtime as base image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime

# Set working directory
WORKDIR /app

# Copy the API project
COPY api/ .

# Create data directory for SQLite
RUN mkdir -p /app/data

# Restore dependencies and build
RUN dotnet restore
RUN dotnet publish -c Release -o out

# Expose port
EXPOSE 8080

# Set environment variables
ENV ASPNETCORE_URLS=http://*:8080

# Run the application
CMD ["dotnet", "out/api.dll"]