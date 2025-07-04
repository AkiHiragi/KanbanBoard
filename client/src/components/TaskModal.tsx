import {Priority, Task} from "../types";
import React, {useEffect, useState} from "react";
import {format} from 'date-fns';

interface TaskModalProps {
    isOpen: boolean;
    task?: Task;
    status: 'todo' | 'inprogress' | 'done';
    onSave: (task: Omit<Task, 'id' | 'createdAt'>) => void;
    onClose: () => void;
}

const TaskModal: React.FC<TaskModalProps> = ({isOpen, task, status, onSave, onClose}) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<Priority>('medium');
    const [dueDate, setDueDate] = useState<string>('');
    const [hasNotification, setHasNotification] = useState(false);
    const [tags, setTags] = useState<string>('');

    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setDescription(task.description || '');
            setPriority(task.priority);
            setDueDate(task.dueDate ? format(task.dueDate, 'yyyy-MM-dd\'T\'HH:mm') : '');
            setHasNotification(task.hasNotification || false);
            setTags(task.tags ? task.tags.join(', ') : '');
        } else {
            setTitle('');
            setDescription('');
            setPriority('medium');
            setDueDate('');
            setHasNotification(false);
            setTags('');
        }
    }, [task]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim()) {
            onSave({
                title: title.trim(),
                description: description.trim(),
                status,
                priority,
                dueDate: dueDate ? new Date(dueDate) : undefined,
                hasNotification: dueDate ? hasNotification : false,
                tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : undefined,
            })
            ;
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h3>{task ? 'Редактировать задачу' : 'Новая задача'}</h3>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Название задачи"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                    <textarea
                        placeholder="Описание (необязательно)"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Теги (через запятую)"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                    />
                    <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as Priority)}
                    >
                        <option value="low">🟢 Низкий</option>
                        <option value="medium">🟡 Средний</option>
                        <option value="high">🔴 Высокий</option>
                    </select>

                    <div className="form-group">
                        <label htmlFor="dueDate">Дедлайн:</label>
                        <input
                            type="datetime-local"
                            id="dueDate"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                        />
                    </div>

                    {dueDate && (
                        <div className="form-group checkbox">
                            <input
                                type="checkbox"
                                id="hasNotification"
                                checked={hasNotification}
                                onChange={(e) => {
                                    if (e.target.checked && 'Notification' in window && Notification.permission === 'default') {
                                        Notification.requestPermission();
                                    }
                                    setHasNotification(e.target.checked)
                                }}
                            />
                            <label htmlFor="hasNotification">Включить уведомление</label>
                        </div>
                    )}

                    <div className="modal-actions">
                        <button type="submit">Сохранить</button>
                        <button type="button" onClick={onClose}>Отмена</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default TaskModal;