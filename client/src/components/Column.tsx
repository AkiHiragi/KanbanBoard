import {Column as ColumnType, Task} from "../types";
import React from "react";
import TaskCard from "./TaskCard";
import {useDroppable} from "@dnd-kit/core";

interface ColumnProps {
    column: ColumnType;
    onAddTask: (status: 'todo' | 'inprogress' | 'done') => void;
    onEditTask: (task: Task) => void;
    onDeleteTask: (taskId: string) => void;
}

const Column: React.FC<ColumnProps> = ({column, onAddTask, onEditTask, onDeleteTask}) => {
    const {setNodeRef, isOver} = useDroppable({
        id: column.status,
    });

    const sortTaskByPriority = (tasks: Task[]): Task[] => {
        const priorityOrder = {high: 3, medium: 2, low: 1};
        return [...tasks].sort((a, b) => {
            const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
            if (priorityDiff !== 0) return priorityDiff;
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        })
    }

    return (
        <div
            className={`column ${isOver ? 'column-over' : ''}`}
            ref={setNodeRef}
        >
            <div className="column-header">
                <div className="column-title">
                    <h3>{column.title}</h3>
                    <span className="task-count">{column.tasks.length}</span>
                </div>
                <button onClick={() => onAddTask(column.status)}>+ Добавить</button>
            </div>
            <div className="column-content">
                {sortTaskByPriority(column.tasks).map(task => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        onEdit={onEditTask}
                        onDelete={onDeleteTask}
                    />
                ))}
            </div>
        </div>
    )
}

export default Column;