import {ApiTask, CreateTaskRequest} from "../services/api";
import {Task} from "../types";

export const convertApiTaskToTask = (apiTask: ApiTask): Task => {
    return {
        id: apiTask.id.toString(),
        title: apiTask.title,
        description: apiTask.description,
        status: convertApiStatusToStatus(apiTask.status),
        priority: convertApiPriorityToPriority(apiTask.priority),
        createdAt: new Date(apiTask.createdAt),
        dueDate: apiTask.dueDate ? new Date(apiTask.dueDate) : undefined,
        hasNotification: apiTask.hasNotification,
        tags: apiTask.tags ? apiTask.tags.split(', ').map(tag => tag.trim()).filter(tag => tag) : undefined,
    };
};

export const convertTaskToCreateRequest = (task: Omit<Task, 'id' | 'createdAt'>): CreateTaskRequest => {
    return {
        title: task.title,
        description: task.description,
        status: convertStatusToApiStatus(task.status),
        priority: convertPriorityToApiPriority(task.priority),
        dueDate: task.dueDate ? new Date(task.dueDate.getTime() - task.dueDate.getTimezoneOffset() * 60000).toISOString() : undefined,
        hasNotification: task.hasNotification,
        tags: task.tags ? task.tags.join(', ') : undefined,
    };
}

const convertStatusToApiStatus = (status: Task['status']): ApiTask['status'] => {
    switch (status) {
        case 'todo':
            return 0;
        case 'inprogress':
            return 1;
        case 'done':
            return 2;
        default:
            return 0;
    }
};

const convertPriorityToApiPriority = (priority: Task['priority']): ApiTask['priority'] => {
    switch (priority) {
        case 'low':
            return 1;
        case 'medium':
            return 2;
        case 'high':
            return 3;
        default:
            return 1;
    }
};

const convertApiStatusToStatus = (status: ApiTask['status']): Task['status'] => {
    switch (status) {
        case 0:
            return 'todo';
        case 1:
            return 'inprogress';
        case 2:
            return 'done';
        default:
            return 'todo';
    }
};

const convertApiPriorityToPriority = (priority: ApiTask['priority']): Task['priority'] => {
    switch (priority) {
        case 1:
            return 'low';
        case 2:
            return 'medium';
        case 3:
            return 'high';
        default:
            return 'low';
    }
};
