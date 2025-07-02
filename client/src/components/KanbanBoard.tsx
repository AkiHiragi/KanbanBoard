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

    const sensors = useSensors(useSensor(PointerSensor));

    useEffect(() => {
        const saved = localStorage.getItem('kanban-tasks');
        if (saved) {
            const tasks: Task[] = JSON.parse(saved);
            setColumns(prev => prev.map(col => ({
                ...col,
                tasks: tasks.filter(task => task.status === col.status)
            })));
        }
    }, []);

    const saveTasks = (allTasks: Task[]) => {
        localStorage.setItem('kanban-tasks', JSON.stringify(allTasks));
    }

    const getAllTasks = (): Task[] => {
        return columns.flatMap(col => col.tasks);
    }

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

    const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
        if (editingTask) {
            const updatedTask = {...editingTask, ...taskData};
            setColumns(prev => prev.map(col => ({
                ...col,
                tasks: col.tasks.map(task => task.id === updatedTask.id ? updatedTask : task)
            })));
            saveTasks(getAllTasks().map(task => task.id === updatedTask.id ? updatedTask : task));
        } else {
            const newTask: Task = {
                id: Date.now().toString(),
                ...taskData,
                createdAt: new Date()
            };
            setColumns(prev => prev.map(col =>
                col.status === currentStatus
                    ? {...col, tasks: [...col.tasks, newTask]}
                    : col
            ));
            saveTasks([...getAllTasks(), newTask]);
        }
    };

    const handleDeleteTask = (taskId: string) => {
        setDeleteConfirm(taskId);
    };

    const confirmDelete = () => {
        if (deleteConfirm) {
            setColumns(prev => prev.map(col => ({
                ...col,
                tasks: col.tasks.filter(task => task.id !== deleteConfirm)
            })));
            saveTasks(getAllTasks().filter(task => task.id !== deleteConfirm));
            setDeleteConfirm(null);
        }
    };

    const cancelDelete = () => {
        setDeleteConfirm(null);
    }

    const handleDragStart = (event: DragStartEvent) => {
        const {active} = event;
        const task = getAllTasks().find(task => task.id === active.id);
        setActiveTask(task || null);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const {active, over} = event;
        console.log('Drag end:', {active: active.id, over: over?.id});
        setActiveTask(null);

        if (!over) return;

        const taskId = active.id as string;
        const newStatus = over.id as 'todo' | 'inprogress' | 'done';

        const allTasks = getAllTasks();
        const task = allTasks.find(task => task.id === taskId);

        if (task && task.status !== newStatus) {
            const updatedTask = {...task, status: newStatus};
            setColumns(prev => prev.map(col => ({
                ...col,
                tasks: col.status === newStatus
                    ? [...col.tasks.filter(t => t.id !== taskId), updatedTask]
                    : col.tasks.filter(t => t.id !== taskId)
            })));

            const updatedTasks = allTasks.map(t => t.id === taskId ? updatedTask : t);
            saveTasks(updatedTasks);
        }
    }

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="kanban-board">
                <h1>Канбан Доска</h1>
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
                                >
                                    Удалить
                                </button>
                                <button onClick={cancelDelete}>Отмена</button>
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

}

export default KanbanBoard;