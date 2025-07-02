using KanbanBoard.Models;
using Microsoft.EntityFrameworkCore;

namespace KanbanBoard.Data;

public class KanbanDbContext : DbContext
{
    public KanbanDbContext(DbContextOptions<KanbanDbContext> options) : base(options)
    {
    }

    public DbSet<TaskItem> Tasks { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<TaskItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.CreatedAt)
                  .HasDefaultValueSql("datetime('now')")
                  .ValueGeneratedOnAdd();
            entity.Property(e => e.UpdatedAt)
                  .HasDefaultValueSql("datetime('now')")
                  .ValueGeneratedOnAddOrUpdate();
        });
    }
}