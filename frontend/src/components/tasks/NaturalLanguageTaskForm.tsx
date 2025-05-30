import React, { useState } from 'react';
import Button from '../ui/Button';
import { taskApi } from '../../services/api';

interface NaturalLanguageTaskFormProps {
  onSubmit: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

const NaturalLanguageTaskForm: React.FC<NaturalLanguageTaskFormProps> = ({
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const [input, setInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      setIsSubmitting(true);
      // Use processTranscript API to extract task details using Gemini
      await taskApi.processTranscript(input);
      setInput('');
      onSubmit();
    } catch (error) {
      console.error('Error creating task from natural language:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add Task with Natural Language</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Describe your task in natural language. For example: "Call John tomorrow at 2pm about the project update"
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="task-input" className="sr-only">Task description</label>
          <textarea
            id="task-input"
            rows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/50 dark:bg-black/30 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="E.g., Schedule a meeting with the team for next Monday at 10am about the project deadline"
            disabled={isLoading || isSubmitting}
          />
        </div>
        
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading || isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!input.trim() || isLoading || isSubmitting}
            isLoading={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Create Task'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NaturalLanguageTaskForm;
