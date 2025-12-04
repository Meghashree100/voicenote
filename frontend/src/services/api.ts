import axios from 'axios';
import type { Task, CreateTaskInput, ParsedVoiceInput } from '../types/task';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const taskApi = {
  // Get all tasks with optional filters
  getTasks: async (filters?: {
    status?: string;
    priority?: string;
    search?: string;
    dueDate?: string;
  }): Promise<Task[]> => {
    const response = await api.get<Task[]>('/tasks', { params: filters });
    return response.data;
  },

  // Get a single task
  getTask: async (id: string): Promise<Task> => {
    const response = await api.get<Task>(`/tasks/${id}`);
    return response.data;
  },

  // Create a new task
  createTask: async (task: CreateTaskInput): Promise<Task> => {
    const response = await api.post<Task>('/tasks', task);
    return response.data;
  },

  // Update a task
  updateTask: async (id: string, updates: Partial<CreateTaskInput>): Promise<Task> => {
    const response = await api.put<Task>(`/tasks/${id}`, updates);
    return response.data;
  },

  // Delete a task
  deleteTask: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },

  // Parse voice input
  parseVoiceInput: async (transcript: string): Promise<ParsedVoiceInput> => {
    const response = await api.post<ParsedVoiceInput>('/parse', { transcript });
    return response.data;
  },
};


