import React, { useState } from 'react';
import Button from '../ui/Button';
import { FaSpinner } from 'react-icons/fa';

interface TranscriptFormProps {
  onSubmit: (transcript: string) => void;
  isLoading: boolean;
}

const TranscriptForm: React.FC<TranscriptFormProps> = ({ onSubmit, isLoading }) => {
  const [transcript, setTranscript] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (transcript.trim()) {
      onSubmit(transcript);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="transcript" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Meeting Transcript
        </label>
        <textarea
          id="transcript"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          rows={10}
          className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          placeholder="Paste your meeting transcript here..."
          style={{ minHeight: '200px' }}
          required
        />
      </div>
      
      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
          className="px-6"
        >
          {isLoading ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              Processing...
            </>
          ) : (
            'Extract Tasks'
          )}
        </Button>
      </div>
    </form>
  );
};

export default TranscriptForm;
