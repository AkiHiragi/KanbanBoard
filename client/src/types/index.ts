export type Priority = 'low' | 'medium' | 'high';

export interface Task {
    id: string;
    title: string;
    description?: string;
    status: 'todo' | 'inprogress' | 'done';
    priority: Priority;
    createdAt: Date;
}

export interface Column {
    id: string;
    title: string;
    status: 'todo' | 'inprogress' | 'done';
    tasks: Task[];
}