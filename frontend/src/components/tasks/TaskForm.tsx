import React, { useState, useEffect } from 'react';
import type { Task } from '../../types';
import Button from '../ui/Button';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaSave, FaTimes } from 'react-icons/fa';

interface TaskFormProps {
  task?: Task;
  onSubmit: (task: Partial<Task>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({
  task,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [assignee, setAssignee] = useState(task?.assignee || '');
  const [dueDate, setDueDate] = useState(task?.due_date ? new Date(task.due_date) : new Date());
  const [priority, setPriority] = useState<'P1' | 'P2' | 'P3' | 'P4'>(task?.priority || 'P3');
  const [status, setStatus] = useState<'todo' | 'in_progress' | 'done'>(task?.status || 'todo');
  const [type, setType] = useState<'manual' | 'transcript'>(task?.type || 'manual');

  // Parse date string from backend
  const parseDate = (dateString: string | Date): Date => {
    // If it's already a Date object, return it
    if (dateString instanceof Date && !isNaN(dateString.getTime())) {
      return dateString;
    }
    
    // If it's a string, try to parse it
    if (typeof dateString === 'string') {
      // Try parsing directly first
      let date = new Date(dateString);
      if (!isNaN(date.getTime())) return date;
      
      // Try to extract date parts from the string
      const match = dateString.match(/([A-Za-z]+)\s+(\d{1,2}),?\s*(\d{4})?(?:\s*at\s*\d{1,2}:\d{2}\s*[AP]M)?/i);
      if (match) {
        const [_, month, day, year = new Date().getFullYear()] = match;
        const monthIndex = new Date(Date.parse(month + ' 1, 2012')).getMonth();
        date = new Date(parseInt(year as string), monthIndex, parseInt(day));
        if (!isNaN(date.getTime())) return date;
      }
    }
    
    // Fallback to current date if parsing fails
    return new Date();
  };

  // Update form when task prop changes
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setAssignee(task.assignee);
      setDueDate(parseDate(task.due_date));
      setPriority(task.priority);
      setStatus(task.status || 'todo');
      setType(task.type || 'manual');
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!title.trim() || !assignee.trim()) {
      alert('Please fill in all required fields');
      return;
    }
    
    const taskData: Partial<Task> = {
      title: title.trim(),
      description: description.trim(),
      assignee: assignee.trim(),
      due_date: dueDate.toISOString().split('T')[0],
      priority,
      status,
      type: type || 'manual', // Use the current type state or default to 'manual'
    };
    
    // If editing, include the task ID and preserve the original type if not manually changed
    if (task?.id) {
      taskData.id = task.id;
      // Only update type if it was explicitly changed
      if (task.type && type === 'manual') {
        taskData.type = task.type;
      }
    }
    
    onSubmit(taskData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Title *
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-white/50 dark:bg-black/30 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          required
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-4 py-2 rounded-lg bg-white/50 dark:bg-black/30 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="assignee" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Assignee *
          </label>
          <input
            type="text"
            id="assignee"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/50 dark:bg-black/30 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required
          />
        </div>
        
        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Due Date *
          </label>
          <DatePicker
            selected={dueDate instanceof Date && !isNaN(dueDate.getTime()) ? dueDate : null}
            onChange={(date: Date | null) => {
              if (date) {
                setDueDate(date);
              }
            }}
            className="w-full px-4 py-2 rounded-lg bg-white/50 dark:bg-black/30 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            dateFormat="MMMM d, yyyy"
            minDate={new Date()}
            showTimeSelect
            timeFormat="h:mm aa"
            timeIntervals={15}
            timeCaption="Time"
            placeholderText="Select due date and time"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Priority
          </label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as 'P1' | 'P2' | 'P3' | 'P4')}
            className="w-full px-4 py-2 rounded-lg bg-white/50 dark:bg-black/30 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="P1">P1 - Critical</option>
            <option value="P2">P2 - High</option>
            <option value="P3">P3 - Medium</option>
            <option value="P4">P4 - Low</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as 'todo' | 'in_progress' | 'done')}
            className="w-full px-4 py-2 rounded-lg bg-white/50 dark:bg-black/30 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Type
          </label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value as 'manual' | 'transcript')}
            className="w-full px-4 py-2 rounded-lg bg-white/50 dark:bg-black/30 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="manual">Manual</option>
            <option value="transcript">Transcript</option>
          </select>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          icon={<FaTimes />}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          icon={<FaSave />}
        >
          {task?.id ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;
