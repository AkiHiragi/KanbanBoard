import React, {useEffect, useState} from "react";
import {Column as ColumnType, Task} from '../types'
import Column from "./Column";
import TaskModal from "./TaskModal";
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors
} from "@dnd-kit/core";
import { apiService } from '../services/api';
import { convertApiTaskToTask, convertTaskToCreateRequest } from '../utils/taskConverter';
import { notificationService } from '../services/notification';

const KanbanBoard: React.FC = () => {
    const [columns, setColumns] = useState<ColumnType[]>([
        {id: '1', title: 'К выполнению', status: 'todo', tasks: []},
        {id: '2', title: 'В работе', status: 'inprogress', tasks: []},
        {id: '3', title: 'Выполнено', status: 'done', tasks: []}
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | undefined>();
    const [currentStatus, setCurrentStatus] = useState<'todo' | 'inprogress' | 'done'>('todo');
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const sensors = useSensors(useSensor(PointerSensor));

    useEffect(() => {
        loadTasks();
        
        // Запрашиваем разрешение на уведомления при загрузке приложения
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
        
        return () => {
            // Очищаем все таймауты при размонтировании компонента
            notificationService.clearAllTimeouts();
        };
    }, []);

    const loadTasks = async () => {
        try {
            setLoading(true);
            const apiTasks = await apiService.getTasks();
            const tasks = apiTasks.map(convertApiTaskToTask);

            setColumns(prev => prev.map(col => ({
                ...col,
                tasks: tasks.filter(task => task.status === col.status)
            })));
            
            // Настраиваем уведомления для загруженных задач
            notificationService.setupNotifications(tasks);
        } catch (error) {
            console.error('Ошибка загрузки задач:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTask = (status: 'todo' | 'inprogress' | 'done') => {
        setCurrentStatus(status);
        setEditingTask(undefined);
        setIsModalOpen(true);
    };

    const handleEditTask = (task: Task) => {
        setEditingTask(task);
        setCurrentStatus(task.status);
        setIsModalOpen(true);
    };

    const handleSaveTask = async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
        try {
            setLoading(true);

            if (editingTask) {
                // Сбрасываем уведомление для задачи, если она изменилась
                notificationService.resetTask(editingTask.id);
                
                // Обновляем локальное состояние сразу
                const updatedTask = { ...editingTask, ...taskData };
                
                setColumns(prev => prev.map(col => ({
                    ...col,
                    tasks: col.tasks.map(task => 
                        task.id === editingTask.id 
                            ? { ...task, ...taskData, id: task.id, createdAt: task.createdAt }
                            : task
                    )
                })));
                
                // Отправляем запрос на сервер
                await apiService.updateTask(parseInt(editingTask.id), convertTaskToCreateRequest(taskData));
                
                // Настраиваем уведомление для обновленной задачи
                if (updatedTask.dueDate && updatedTask.hasNotification) {
                    notificationService.setupNotifications([updatedTask]);
                }
            } else {
                // Для новой задачи ждем ответа сервера, чтобы получить ID
                const newTask = await apiService.createTask(convertTaskToCreateRequest(taskData));
                const clientTask = convertApiTaskToTask(newTask);
                
                // Добавляем новую задачу в соответствующую колонку
                setColumns(prev => prev.map(col => 
                    col.status === clientTask.status 
                        ? { ...col, tasks: [...col.tasks, clientTask] }
                        : col
                ));
                
                // Настраиваем уведомление для новой задачи
                if (clientTask.dueDate && clientTask.hasNotification) {
                    notificationService.setupNotifications([clientTask]);
                }
            }

            setIsModalOpen(false);
        } catch (error) {
            console.error('Ошибка сохранения задачи:', error);
            // В случае ошибки загружаем актуальное состояние с сервера
            await loadTasks();
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTask = (taskId: string) => {
        setDeleteConfirm(taskId);
    };

    const confirmDelete = async () => {
        if (deleteConfirm) {
            try {
                setLoading(true);
                
                // Сбрасываем уведомление для удаляемой задачи
                notificationService.resetTask(deleteConfirm);
                
                // Обновляем локальное состояние сразу
                setColumns(prev => prev.map(col => ({
                    ...col,
                    tasks: col.tasks.filter(task => task.id !== deleteConfirm)
                })));
                
                // Отправляем запрос на сервер
                await apiService.deleteTask(parseInt(deleteConfirm));
                setDeleteConfirm(null);
            } catch (error) {
                console.error('Ошибка удаления задачи:', error);
                // В случае ошибки загружаем актуальное состояние с сервера
                await loadTasks();
            } finally {
                setLoading(false);
            }
        }
    };

    const cancelDelete = () => {
        setDeleteConfirm(null);
    };

    const handleDragStart = (event: DragStartEvent) => {
        const {active} = event;
        const task = columns.flatMap(col => col.tasks).find(task => task.id === active.id);
        setActiveTask(task || null);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const {active, over} = event;
        setActiveTask(null);

        if (!over) return;

        const taskId = active.id as string;
        const newStatus = over.id as 'todo' | 'inprogress' | 'done';

        const task = columns.flatMap(col => col.tasks).find(task => task.id === taskId);

        if (task && task.status !== newStatus) {
            try {
                // Сбрасываем уведомление для задачи, если она перемещена в статус "Выполнено"
                if (newStatus === 'done' && task.dueDate && task.hasNotification) {
                    notificationService.resetTask(task.id);
                }
                
                // Обновляем состояние локально для мгновенной реакции UI
                const updatedTask = {...task, status: newStatus};
                
                setColumns(prev => prev.map(col => ({
                    ...col,
                    tasks: col.status === task.status
                        ? col.tasks.filter(t => t.id !== task.id)
                        : col.status === newStatus
                            ? [...col.tasks, updatedTask]
                            : col.tasks
                })));
                
                // Затем отправляем запрос на сервер
                setLoading(true);
                await apiService.updateTask(parseInt(taskId), convertTaskToCreateRequest(updatedTask));
            } catch (error) {
                console.error('Ошибка перемещения задачи:', error);
                // В случае ошибки возвращаем исходное состояние
                await loadTasks();
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="kanban-board">
                <h1>Канбан Доска {loading && '(Загрузка...)'}</h1>
                <div className="columns">
                    {columns.map(column => (
                        <Column
                            key={column.id}
                            column={column}
                            onAddTask={handleAddTask}
                            onEditTask={handleEditTask}
                            onDeleteTask={handleDeleteTask}
                        />
                    ))}
                </div>
                <TaskModal
                    isOpen={isModalOpen}
                    task={editingTask}
                    status={currentStatus}
                    onSave={handleSaveTask}
                    onClose={() => setIsModalOpen(false)}
                />
                {deleteConfirm && (
                    <div className="modal-overlay">
                        <div className="modal confirm-modal">
                            <h3>⚠️ Подтвердите удаление</h3>
                            <p>Вы уверены, что хотите удалить эту задачу?</p>
                            <div className="modal-actions">
                                <button
                                    onClick={confirmDelete}
                                    className="delete-btn"
                                    disabled={loading}
                                >
                                    Удалить
                                </button>
                                <button onClick={cancelDelete} disabled={loading}>Отмена</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <DragOverlay>
                {activeTask ? (
                    <div className="task-card-wrapper">
                        <div className="task-card">
                            <div className="task-content">
                                <div className="task-header">
                                    <h4>{activeTask.title}</h4>
                                    <span className="priotiry-badge">
                                        {activeTask.priority === 'high' ? '🔴' : 
                                         activeTask.priority === 'medium' ? '🟡' : '🟢'}
                                    </span>
                                </div>
                                {activeTask.description && <p>{activeTask.description}</p>}
                            </div>
                        </div>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};

export default KanbanBoard;