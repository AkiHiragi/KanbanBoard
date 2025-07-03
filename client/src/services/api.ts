const API_BASE_URL = 'http://localhost:5000/api'

export interface ApiTask {
    id: number,
    title: string,
    description?: string,
    status: 'Todo' | 'InProgress' | 'Done';
    priority: 'Low' | 'Medium' | 'High';
    createdAt: string;
    updatedAt: string;
}

export interface CreateTaskRequest {
    title: string,
    description?: string,
    status: 'Todo' | 'InProgress' | 'Done';
    priority: 'Low' | 'Medium' | 'High';
}

class ApiService {
    private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
        const url = `${API_BASE_URL}/${endpoint}`;
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
            ...options,
        });

        if (!response.ok) {
            throw new Error(`API Error ${response.status} ${response.statusText}`);
        }

        return response.json();
    }

    async getTasks(): Promise<ApiTask[]> {
        return this.request<ApiTask[]>('tasks');
    }

    async createTask(task: CreateTaskRequest): Promise<ApiTask> {
        return this.request<ApiTask>('tasks', {
            method: 'POST',
            body: JSON.stringify(task),
        });
    }

    async updateTask(id: number, task: CreateTaskRequest): Promise<void> {
        await this.request(`tasks/${id}`, {
            method: 'PUT',
            body: JSON.stringify({...task, id}),
        })
    }

    async deleteTask(id: number): Promise<void> {
        await this.request(`tasks/${id}`, {
            method: 'DELETE',
        });
    }
}

export const apiService = new ApiService();