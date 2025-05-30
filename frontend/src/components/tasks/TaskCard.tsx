import React from 'react';
import type { Task } from '../../types';
import { FaEdit, FaTrash, FaCheck, FaClock, FaExclamationTriangle } from 'react-icons/fa';
import Button from '../ui/Button';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: 'todo' | 'in_progress' | 'done') => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onStatusChange }) => {
  // Parse date string from backend
  const parseDate = (dateString: string): Date => {
    // Try parsing directly first
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) return date;
    
    // Try to extract date parts from the string
    const match = dateString.match(/([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})(?:\s*at\s*\d{1,2}:\d{2}\s*[AP]M)?/i);
    if (match) {
      const [_, month, day, year] = match;
      const monthIndex = new Date(Date.parse(month + ' 1, 2012')).getMonth();
      return new Date(parseInt(year), monthIndex, parseInt(day));
    }
    
    // Fallback to current date if parsing fails
    return new Date();
  };

  // Format the date to be more readable
  const formatDate = (dateString: string) => {
    const date = parseDate(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Determine if task is overdue
  const isOverdue = () => {
    const dueDate = parseDate(task.due_date);
    const today = new Date();
    // Reset time part to compare only dates
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today && task.status !== 'done';
  };

  // Get priority color
  const getPriorityColor = () => {
    switch (task.priority) {
      case 'P1':
        return 'text-red-600 dark:text-red-400';
      case 'P2':
        return 'text-orange-600 dark:text-orange-400';
      case 'P3':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'P4':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  // Get status badge with appropriate styling based on task status
  const getStatusBadge = () => {
    switch (task.status) {
      case 'todo':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
            To Do
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
            In Progress
          </span>
        );
      case 'done':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-green-200 dark:bg-green-900 text-green-800 dark:text-green-200">
            Done
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
            To Do
          </span>
        );
    }
  };

  // Get task type badge
  const getTypeBadge = () => (
    <div className={`absolute top-0 left-0 px-2 py-1 text-xs font-medium text-white ${task.type === 'transcript' ? 'bg-blue-500' : 'bg-purple-500'} rounded-br-lg`}>
      {task.type === 'transcript' ? 'Transcript' : 'Manual'}
    </div>
  );

  return (
    <div className={`rounded-lg shadow-md p-4 mb-4 transition-all duration-200 relative overflow-hidden ${isOverdue() ? 'border-l-4 border-red-500' : ''} ${task.status === 'done' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-white dark:bg-gray-800'}`}>
      {getTypeBadge()}
      <div className="absolute top-2 right-2 flex items-center space-x-2">
        <div className="mr-2">
          {getStatusBadge()}
        </div>
      </div>
      <div className="flex justify-between items-start pt-8">
        <div className="flex-1 pr-4">
          <h3 className={`text-lg font-semibold ${task.status === 'done' ? 'line-through text-gray-500' : 'text-gray-800 dark:text-white'}`}>
            {task.title}
          </h3>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${getPriorityColor()}`}>
            {task.priority}
          </span>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            icon={<FaEdit />} 
            onClick={() => onEdit(task)}
            aria-label="Edit task"
          />
          <Button 
            variant="danger" 
            size="sm" 
            icon={<FaTrash />} 
            onClick={() => onDelete(task.id!)}
            aria-label="Delete task"
          />
        </div>
      </div>
      
      {task.description && (
        <p className="mt-3 text-gray-600 dark:text-gray-300">{task.description}</p>
      )}
      
      <div className="mt-4 flex flex-wrap justify-between items-center">
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <span className="mr-4">
            <strong>Assignee:</strong> {task.assignee}
          </span>
          <span className="flex items-center">
            {isOverdue() ? (
              <FaExclamationTriangle className="text-red-500 mr-1" />
            ) : (
              <FaClock className="mr-1" />
            )}
            <span className={isOverdue() ? 'text-red-500' : ''}>
              Due: {formatDate(task.due_date)}
            </span>
          </span>
        </div>
        
        {task.status !== 'done' && (
          <Button 
            variant="primary" 
            size="sm" 
            icon={<FaCheck />} 
            onClick={() => onStatusChange(task.id!, 'done')}
            className="mt-2 sm:mt-0"
          >
            Mark Complete
          </Button>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
