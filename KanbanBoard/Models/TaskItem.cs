namespace KanbanBoard.Models;

public enum Priority
{
    Low    = 1,
    Medium = 2,
    High   = 3
}

public enum TaskStatus
{
    Todo       = 0,
    InProgress = 1,
    Done       = 2
}

public class TaskItem
{
    public int        Id          { get; set; }
    public string     Title       { get; set; } = string.Empty;
    public string?    Description { get; set; }
    public Priority   Priority    { get; set; }
    public TaskStatus Status      { get; set; }
    public DateTime   CreatedAt   { get; set; }
    public DateTime   UpdatedAt   { get; set; }
}