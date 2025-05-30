import { Request, Response } from 'express';
import * as taskModel from '../models/task.model';
import { parseTaskFromText, formatDate } from '../services/nlp.service';
import TranscriptParserService from '../services/TranscriptParserService';

export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, type = 'manual' } = req.body;
    
    if (!text) {
      res.status(400).json({ error: 'Text is required' });
      return;
    }
    
    const parsedTask = parseTaskFromText(text);
    const task = await taskModel.createTask({
      title: parsedTask.title,
      description: parsedTask.description,
      assignee: parsedTask.assignee,
      due_date: parsedTask.due_date,
      priority: parsedTask.priority,
      type: type as 'manual' | 'transcript'
    });
    
    const response = {
      ...task,
      due_date: formatDate(new Date(task.due_date)),
    };
    
    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
};

export const getTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const tasks = await taskModel.getTasks();
    
    // Format dates for display
    const formattedTasks = tasks.map(task => ({
      ...task,
      due_date: formatDate(new Date(task.due_date)),
      created_at: formatDate(new Date(task.created_at!)),
      updated_at: formatDate(new Date(task.updated_at!)),
    }));
    
    res.json(formattedTasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

export const getTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const taskId = parseInt(req.params.id);
    if (isNaN(taskId)) {
      res.status(400).json({ error: 'Invalid task ID' });
      return;
    }
    
    const task = await taskModel.getTaskById(taskId);
    
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    
    const response = {
      ...task,
      due_date: formatDate(new Date(task.due_date)),
      created_at: formatDate(new Date(task.created_at!)),
      updated_at: formatDate(new Date(task.updated_at!)),
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
};

export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const taskId = parseInt(req.params.id);
    if (isNaN(taskId)) {
      res.status(400).json({ error: 'Invalid task ID' });
      return;
    }
    
    const { title, description, assignee, due_date, priority, status } = req.body;
    
    const updatedTask = await taskModel.updateTask(taskId, {
      title,
      description,
      assignee,
      due_date: due_date ? new Date(due_date) : undefined,
      priority,
      status,
    });
    
    if (!updatedTask) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    
    const response = {
      ...updatedTask,
      due_date: formatDate(new Date(updatedTask.due_date)),
      created_at: formatDate(new Date(updatedTask.created_at!)),
      updated_at: formatDate(new Date(updatedTask.updated_at!)),
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
};

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const taskId = parseInt(req.params.id);
    if (isNaN(taskId)) {
      res.status(400).json({ error: 'Invalid task ID' });
      return;
    }
    
    const success = await taskModel.deleteTask(taskId);
    
    if (!success) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};

export const processTranscript = async (req: Request, res: Response): Promise<void> => {
  try {
    const { transcript } = req.body;
    
    if (!transcript) {
      res.status(400).json({ error: 'Transcript is required' });
      return;
    }
    
    // Extract tasks from transcript
    const extractedTasks = await TranscriptParserService.extractTasksFromTranscript(transcript);
    
    // Save extracted tasks to database
    const savedTasks = [];
    for (const task of extractedTasks) {
      try {
        const savedTask = await taskModel.createTask({
          title: task.title,
          description: task.description,
          assignee: task.assignee,
          due_date: task.due_date,
          priority: task.priority,
          type: 'transcript' as const
        });
        savedTasks.push(savedTask);
      } catch (error) {
        console.error('Error saving extracted task:', error);
        // Continue with other tasks if one fails
      }
    }
    
    res.status(201).json({
      message: `Successfully extracted and saved ${savedTasks.length} tasks`,
      tasks: savedTasks.map(task => ({
        ...task,
        due_date: formatDate(new Date(task.due_date))
      }))
    });
  } catch (error) {
    console.error('Error processing transcript:', error);
    res.status(500).json({ error: 'Failed to process transcript' });
  }
};

export const getTaskStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const tasks = await taskModel.getTasks();
    
    // Calculate status counts
    const statusCounts: Record<string, number> = tasks.reduce(
      (acc, task) => {
        const status = task.status || 'todo';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    
    // Calculate completion data
    const completedCount = statusCounts['done'] || 0;
    const pendingCount = (statusCounts['todo'] || 0) + (statusCounts['in_progress'] || 0);
    const totalTasks = tasks.length;
    
    // Calculate task distribution by type
    const taskDistribution = tasks.reduce(
      (acc, task) => {
        // Use type property or default to 'manual' if not specified
        const type = task.type || 'manual';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      },
      { manual: 0, transcript: 0 } as Record<string, number>
    );
    
    // Calculate daily task counts (tasks due on each day)
    const today = new Date();
    const next7Days = new Date(today);
    next7Days.setDate(today.getDate() + 7);
    
    const dueTasks = tasks.filter(task => {
      const dueDate = new Date(task.due_date);
      return dueDate >= today && dueDate <= next7Days;
    });
    
    const dailyTaskCounts = dueTasks.reduce<Array<{date: string, count: number}>>((acc, task) => {
      const dueDate = formatDate(new Date(task.due_date));
      const existingDay = acc.find(item => item.date === dueDate);
      
      if (existingDay) {
        existingDay.count += 1;
      } else {
        acc.push({ date: dueDate, count: 1 });
      }
      
      return acc;
    }, []);
    
    // Format response in the ChartData format expected by frontend
    const response = {
      labels: Object.keys(statusCounts),
      datasets: [
        {
          label: 'Tasks by Status',
          data: Object.values(statusCounts),
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
          ],
        },
      ],
      completionData: [
        { name: 'Completed', value: completedCount },
        { name: 'Pending', value: pendingCount },
      ],
      taskDistribution: [
        { name: 'Manual', value: taskDistribution.manual },
        { name: 'Transcript', value: taskDistribution.transcript },
      ],
      dailyTaskCounts,
      taskStats: {
        total: totalTasks,
        completed: completedCount,
        pending: pendingCount,
        overdue: tasks.filter(task => {
          const dueDate = new Date(task.due_date);
          return dueDate < today && (task.status !== 'done');
        }).length,
      },
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching task stats:', error);
    res.status(500).json({ error: 'Failed to fetch task statistics' });
  }
};
