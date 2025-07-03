import {Task} from "../types";
import React from "react";
import {useDraggable} from "@dnd-kit/core";
import { format, isPast, isToday } from 'date-fns';

interface TaskCardProps {
    task: Task;
    onEdit: (task: Task) => void;
    onDelete: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({task, onEdit, onDelete}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        isDragging
    } = useDraggable({
        id: task.id,
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
    } : undefined;

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return '#ff4757';
            case 'medium':
                return '#ffa502';
            case 'low':
                return '#2ed573';
            default:
                return '#667eea';
        }
    }

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case 'high':
                return '🔴';
            case 'medium':
                return '🟡';
            case 'low':
                return '🟢';
            default:
                return '⚪';
        }
    }

    // Предотвращаем перетаскивание при клике на кнопки
    const handleButtonClick = (e: React.MouseEvent) => {
        // Останавливаем всплытие события, чтобы не активировать drag
        e.stopPropagation();
    };

    return (
        <div className="task-card-wrapper">
            <div className="task-card"
                ref={setNodeRef}
                style={{
                    ...style,
                    borderLeftColor: getPriorityColor(task.priority)
                }}
                {...listeners}
                {...attributes}
            >
                <div className="task-content">
                    <div className="task-header">
                        <h4>{task.title}</h4>
                        <span className="priotiry-badge">
                            {getPriorityIcon(task.priority)}
                        </span>
                    </div>
                    {task.description && <p>{task.description}</p>}
                    
                    {task.dueDate && (
                        <div className={`task-due-date ${isPast(task.dueDate) && task.status !== 'done' ? 'overdue' : ''} ${isToday(task.dueDate) ? 'today' : ''}`}>
                            <span className="due-date-icon">{task.hasNotification ? '🔔' : '⏰'}</span>
                            <span>{format(task.dueDate, 'dd.MM.yyyy HH:mm')}</span>
                        </div>
                    )}
                </div>
            </div>
            <div className="task-actions" onClick={handleButtonClick}>
                <button onClick={() => onEdit(task)}>
                    Изменить
                </button>
                <button onClick={() => onDelete(task.id)}>
                    Удалить
                </button>
            </div>
        </div>
    );
}

export default TaskCard;