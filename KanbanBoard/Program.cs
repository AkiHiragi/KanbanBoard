using System.Diagnostics;
using KanbanBoard.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<KanbanDbContext>(options =>
{
    options.UseSqlite(
        builder.Configuration.GetConnectionString("DefaultConnection"));
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    _ = Task.Run(async () =>
    {
        await Task.Delay(2000);

        try
        {
            var clientPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "client");
            if (Directory.Exists(clientPath))
            {
                var processInfo = new ProcessStartInfo
                {
                    FileName         = "cmd",
                    Arguments        = "/c npm start",
                    WorkingDirectory = clientPath,
                    UseShellExecute  = false,
                    CreateNoWindow   = true
                };
                Process.Start(processInfo);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Не удалось запустить React: {ex.Message}");
        }
    });

    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "KANBAN API V1");
        c.RoutePrefix = string.Empty;
    });
}

app.UseHttpsRedirection();
app.UseCors("AllowReactApp");
app.UseAuthorization();

app.MapControllers();

app.Run();