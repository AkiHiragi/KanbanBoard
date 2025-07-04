export type Priority = 'low' | 'medium' | 'high';

export interface Task {
    id: string;
    title: string;
    description?: string;
    status: 'todo' | 'inprogress' | 'done';
    priority: Priority;
    createdAt: Date;
    dueDate?: Date;
    hasNotification?: boolean;
    tags?: string[];
}

export interface Column {
    id: string;
    title: string;
    status: 'todo' | 'inprogress' | 'done';
    tasks: Task[];
}