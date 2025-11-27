using Microsoft.EntityFrameworkCore;
using HomeCareApp.Models;
using Microsoft.AspNetCore.Identity;

namespace HomeCareApp.Data;

public static class DBInit
{
    public static async Task Seed(IApplicationBuilder app)
    {
        using var serviceScope = app.ApplicationServices.CreateScope();
        AppDbContext db = serviceScope.ServiceProvider.GetRequiredService<AppDbContext>();
        
        // Database will be empty except for any users created through registration
        
        await Task.CompletedTask;
    }
}