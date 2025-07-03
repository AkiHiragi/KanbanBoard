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
                await apiService.updateTask(parseInt(editingTask.id), convertTaskToCreateRequest(taskData));
            } else {
                await apiService.createTask(convertTaskToCreateRequest(taskData));
            }

            await loadTasks();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Ошибка сохранения задачи:', error);
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
                await apiService.deleteTask(parseInt(deleteConfirm));
                await loadTasks();
                setDeleteConfirm(null);
            } catch (error) {
                console.error('Ошибка удаления задачи:', error);
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
                setLoading(true);
                const updatedTaskData = { ...task, status: newStatus };
                await apiService.updateTask(parseInt(taskId), convertTaskToCreateRequest(updatedTaskData));
                await loadTasks();
            } catch (error) {
                console.error('Ошибка перемещения задачи:', error);
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
                    <div className="task-card">
                        <h4>{activeTask.title}</h4>
                        {activeTask.description && <p>{activeTask.description}</p>}
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};

export default KanbanBoard;