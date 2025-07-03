import {ApiTask, CreateTaskRequest} from "../services/api";
import {Task} from "../types";

export const convertApiTaskToTask = (apiTask:ApiTask):Task=>{
    return {
        id: apiTask.id.toString(),
        title: apiTask.title,
        description: apiTask.description,
        status: convertApiStatusToStatus(apiTask.status),
        priority: convertApiPriorityToPriority(apiTask.priority),
        createdAt: new Date(apiTask.createdAt)
    };
};

export const convertTaskToCreateRequest=(task:Omit<Task, 'id'|'createdAt'>):CreateTaskRequest=>{
    return {
        title: task.title,
        description: task.description,
        status: convertStatusToApiStatus(task.status),
        priority: convertPriorityToApiPriority(task.priority)
    };
}

const convertStatusToApiStatus = (status:Task['status']):ApiTask['status']=>{
    switch (status){
        case 'todo': return 'Todo';
        case 'inprogress': return 'InProgress';
        case 'done': return 'Done';
        default: return 'Todo';
    }
};

const convertPriorityToApiPriority = (priority:Task['priority']):ApiTask['priority']=>{
    switch (priority){
        case 'low': return 'Low';
        case 'medium': return 'Medium';
        case 'high': return 'High';
        default: return 'Low';
    }
};

const convertApiStatusToStatus = (status:ApiTask['status']):Task['status']=>{
    switch (status){
        case 'Todo': return 'todo';
        case 'InProgress': return 'inprogress';
        case 'Done': return 'done';
        default: return 'todo';
    }
};

const convertApiPriorityToPriority = (priority:ApiTask['priority']):Task['priority']=>{
    switch (priority){
        case 'Low': return 'low';
        case 'Medium': return 'medium';
        case 'High': return 'high';
        default: return 'low';
    }
};
