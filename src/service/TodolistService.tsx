import { Task, TaskCreate, TaskUpdate } from '../models/TodolistModel';
import HttpClient from './httpClient';
import { AxiosHeaders } from 'axios';

export default class TodoService {
    httpClient: HttpClient;
    private endpoint: string = 'http://localhost:3000/'; // Updated the base URL for the local backend

    constructor() {
        this.httpClient = new HttpClient({
            baseUrl: 'http://localhost:3000',
            headers: new AxiosHeaders().set('Content-Type', 'application/json')
        });
    }

    // Fetch all tasks
    getAllTasks = async ({ signal }: { signal?: AbortSignal }): Promise<Task[]> => {
        try {
            const response: any = await this.httpClient.get(this.endpoint + 'tasks', { signal });
            return response.tasks || []; // Extract and return the tasks array
        } catch (error) {
            console.error('Error fetching tasks:', error);
            throw error;
        }
    };

    // Fetch incomplete tasks
    getIncompletedTasks = async (persNo: string, programId?: number, signal?: AbortSignal): Promise<Task[]> => {
        try {
            let url = `${this.endpoint}tasks/incompleted?persNo=${encodeURIComponent(persNo)}`;
            if (programId !== undefined && programId !== -5) {
                url += `&programId=${encodeURIComponent(programId)}`;
            }
            const response: any = await this.httpClient.get(url, { signal });
            return response.tasks || []; // Extract and return the tasks array
        } catch (error) {
            console.error('Error fetching incompleted tasks:', error);
            throw error;
        }
    };

    // Fetch completed tasks
    getCompletedTasks = async (persNo: string, programId?: number, count?: number, signal?: AbortSignal): Promise<Task[]> => {
        try {
            let url = `${this.endpoint}tasks/completed?persNo=${encodeURIComponent(persNo)}`;
            if (programId !== undefined) {
                url += `&programId=${encodeURIComponent(programId)}`;
            }
            if (count !== undefined) {
                url += `&count=${encodeURIComponent(count)}`;
            }
            const response: any = await this.httpClient.get(url, { signal });
            return response.tasks || []; // Extract and return the tasks array
        } catch (error) {
            console.error('Error fetching completed tasks:', error);
            throw error;
        }
    };

    // Create a new task
    createTask = async (task: TaskCreate): Promise<Task> => {
        try {
            const url = `${this.endpoint}tasks`; // Endpoint to create task
            const response = await this.httpClient.post<TaskCreate, { data: Task }>(url, task);
            return response.data; // Return the created task
        } catch (error) {
            console.error('Error creating task:', error);
            throw error;
        }
    };

    // Update (edit) an existing task
    editTask = async (task: TaskUpdate): Promise<Task> => {
        try {
            const url = `${this.endpoint}tasks/${task.ToDolistId}`; // Adjust the endpoint to update task
            const response = await this.httpClient.put<TaskUpdate, { data: Task }>(url, task);
            return response.data; // Return the updated task
        } catch (error) {
            console.error('Error editing task:', error);
            throw error;
        }
    };

    // Deactivate a task
    deactivateTask = async (id: number, signal?: AbortSignal): Promise<any> => {
        try {
            const url = `${this.endpoint}tasks/${id}/deactivate`; // Endpoint to deactivate task
            const response: any = await this.httpClient.post(url, null, { signal });
            return response.data;
        } catch (error) {
            console.error('Error deactivating task:', error);
            throw error;
        }
    };
}
