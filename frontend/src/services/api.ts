import axios, { AxiosError } from 'axios';
import type { AxiosResponse } from 'axios';
import type { Task, ChartData } from '../types';

// Create an axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor for adding auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access (e.g., redirect to login)
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Task API functions
export const taskApi = {
  // Get all tasks
  getTasks: async (): Promise<Task[]> => {
    try {
      const response = await api.get('/tasks');
      return response.data;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  },

  // Get a single task by ID
  getTask: async (id: number): Promise<Task> => {
    try {
      const response = await api.get(`/tasks/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching task ${id}:`, error);
      throw error;
    }
  },

  // Create a new manual task
  createTask: async (task: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'status'>): Promise<Task> => {
    try {
      // Format the task data as a text string for the NLP parser
      const { title, description, assignee, due_date, priority } = task;
      const dueDate = new Date(due_date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      const taskText = `${title}${description ? `: ${description}` : ''} assigned to ${assignee} due ${dueDate} with priority ${priority}`;
      
      // Send the text to the backend for processing
      const response = await api.post('/tasks', { text: taskText });
      return response.data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  // Create a task from natural language text
  createTaskFromText: async (text: string): Promise<Task> => {
    try {
      const response = await api.post('/tasks', { 
        text,
        type: 'transcript' // Ensure tasks created from natural language are marked as transcript type
      });
      return response.data;
    } catch (error) {
      console.error('Error creating task from text:', error);
      throw error;
    }
  },

  // Process transcript and extract tasks
  processTranscript: async (transcript: string): Promise<Task[]> => {
    try {
      const response = await api.post('/tasks/transcript', { transcript });
      return response.data;
    } catch (error) {
      console.error('Error processing transcript:', error);
      throw error;
    }
  },

  // Update a task
  updateTask: async (id: number, task: Partial<Task>): Promise<Task> => {
    try {
      const response = await api.put(`/tasks/${id}`, task);
      return response.data;
    } catch (error) {
      console.error(`Error updating task ${id}:`, error);
      throw error;
    }
  },

  // Delete a task
  deleteTask: async (id: number): Promise<void> => {
    try {
      await api.delete(`/tasks/${id}`);
    } catch (error) {
      console.error(`Error deleting task ${id}:`, error);
      throw error;
    }
  },

  // Get task statistics for dashboard
  getTaskStats: async (): Promise<ChartData> => {
    try {
      const response = await api.get('/tasks/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching task stats:', error);
      // Return empty data if there's an error
      return {
        labels: [],
        datasets: [],
        completionData: [],
        taskDistribution: [],
        dailyTaskCounts: [],
        taskStats: {
          total: 0,
          completed: 0,
          pending: 0,
          overdue: 0
        }
      };
    }
  },
};
