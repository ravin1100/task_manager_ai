import React, { useState, useEffect } from 'react';
import { Tab, Dialog } from '@headlessui/react';
import { FaPlus, FaFilter, FaSearch, FaKeyboard, FaLanguage, FaTimes } from 'react-icons/fa';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import TaskCard from '../components/tasks/TaskCard';
import TaskForm from '../components/tasks/TaskForm';
import TranscriptForm from '../components/tasks/TranscriptForm';
import NaturalLanguageTaskForm from '../components/tasks/NaturalLanguageTaskForm';
import { taskApi } from '../services/api';
import type { Task } from '../types';

const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isTranscriptFormOpen, setIsTranscriptFormOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [taskCreationType, setTaskCreationType] = useState<'manual' | 'natural'>('manual');

  // Fetch tasks
  useEffect(() => {
    fetchTasks();
  }, []);

  // Apply filters when tasks, searchTerm, or statusFilter changes
  useEffect(() => {
    applyFilters();
  }, [tasks, searchTerm, statusFilter, activeTab]);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const data = await taskApi.getTasks();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...tasks];
    
    // Filter by tab (manual or transcript)
    if (activeTab === 0) { // Manual tasks
      filtered = filtered.filter(task => !task.type || task.type === 'manual');
    } else { // Transcript tasks
      filtered = filtered.filter(task => task.type === 'transcript');
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        task =>
          task.title.toLowerCase().includes(term) ||
          (task.description && task.description.toLowerCase().includes(term)) ||
          task.assignee.toLowerCase().includes(term)
      );
    }
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }
    
    setFilteredTasks(filtered);
  };

  const handleCreateTask = async (task: Partial<Task>) => {
    try {
      setIsSubmitting(true);
      await taskApi.createTask(task as Omit<Task, 'id' | 'created_at' | 'updated_at' | 'status'>);
      setIsFormOpen(false);
      fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTask = async (task: Partial<Task>) => {
    if (!task.id) return;
    
    try {
      setIsSubmitting(true);
      await taskApi.updateTask(task.id, task);
      setIsFormOpen(false);
      setSelectedTask(null);
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      await taskApi.deleteTask(id);
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleStatusChange = async (id: number, status: 'todo' | 'in_progress' | 'done') => {
    try {
      await taskApi.updateTask(id, { status });
      fetchTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleProcessTranscript = async (transcript: string) => {
    try {
      setIsSubmitting(true);
      await taskApi.processTranscript(transcript);
      setIsTranscriptFormOpen(false);
      fetchTasks();
    } catch (error) {
      console.error('Error processing transcript:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsFormOpen(true);
  };

  const handleTabChange = (index: number) => {
    setActiveTab(index);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Tasks</h1>
        <div className="flex space-x-2">
          <Button 
            variant="primary" 
            icon={<FaPlus />} 
            onClick={() => setIsNewTaskModalOpen(true)}
          >
            New Task
          </Button>
        </div>
      </div>

      {/* New Task Modal */}
      <Dialog open={isNewTaskModalOpen} onClose={() => setIsNewTaskModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-2xl rounded-2xl bg-white dark:bg-gray-800 p-6">
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white">
                Create New Task
              </Dialog.Title>
              <button
                onClick={() => setIsNewTaskModalOpen(false)}
                className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200"
              >
                <span className="sr-only">Close</span>
                <FaTimes className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setTaskCreationType('manual')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    taskCreationType === 'manual'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <FaKeyboard className={`h-6 w-6 ${
                      taskCreationType === 'manual' 
                        ? 'text-primary-600 dark:text-primary-400' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`} />
                    <span className="font-medium text-gray-900 dark:text-white">Manual Entry</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">Fill out all task details</p>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setTaskCreationType('natural')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    taskCreationType === 'natural'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <FaLanguage className={`h-6 w-6 ${
                      taskCreationType === 'natural' 
                        ? 'text-primary-600 dark:text-primary-400' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`} />
                    <span className="font-medium text-gray-900 dark:text-white">Natural Language</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">Describe your task in plain English</p>
                  </div>
                </button>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                {taskCreationType === 'manual' ? (
                  <TaskForm
                    onSubmit={async (task) => {
                      await handleCreateTask(task);
                      setIsNewTaskModalOpen(false);
                    }}
                    onCancel={() => setIsNewTaskModalOpen(false)}
                    isLoading={isSubmitting}
                  />
                ) : (
                  <NaturalLanguageTaskForm
                    onSubmit={() => {
                      setIsNewTaskModalOpen(false);
                      fetchTasks();
                    }}
                    onCancel={() => setIsNewTaskModalOpen(false)}
                    isLoading={isSubmitting}
                  />
                )}
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Task Tabs */}
      <Tab.Group onChange={handleTabChange}>
        <Tab.List className="glass flex space-x-1 rounded-xl p-1">
          <Tab
            className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors
               ${
                 selected
                   ? 'bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 shadow'
                   : 'text-gray-600 dark:text-gray-300 hover:bg-white/[0.12] hover:text-primary-600 dark:hover:text-primary-400'
               }`
            }
          >
            Manual Tasks
          </Tab>
          <Tab
            className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors
               ${
                 selected
                   ? 'bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 shadow'
                   : 'text-gray-600 dark:text-gray-300 hover:bg-white/[0.12] hover:text-primary-600 dark:hover:text-primary-400'
               }`
            }
          >
            Transcript Tasks
          </Tab>
        </Tab.List>
        <Tab.Panels>
          {/* Both panels have the same structure but will show different filtered tasks */}
          {[0, 1].map((tabIndex) => (
            <Tab.Panel key={tabIndex} className="mt-6">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="relative w-full sm:w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    className="pl-10 pr-4 py-2 w-full rounded-lg bg-white/50 dark:bg-black/30 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <FaFilter className="text-gray-500 dark:text-gray-400" />
                  <select
                    className="px-4 py-2 rounded-lg bg-white/50 dark:bg-black/30 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>

              {/* Task List */}
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
                </div>
              ) : filteredTasks.length > 0 ? (
                <div className="space-y-4">
                  {filteredTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </div>
              ) : (
                <Card className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    {searchTerm || statusFilter !== 'all'
                      ? 'No tasks match your filters'
                      : activeTab === 0
                      ? 'No manual tasks yet'
                      : 'No transcript tasks yet'}
                  </p>
                  <Button
                    variant="primary"
                    icon={<FaPlus />}
                    onClick={() => {
                      if (activeTab === 0) {
                        setSelectedTask(null);
                        setIsFormOpen(true);
                      } else {
                        setIsTranscriptFormOpen(true);
                      }
                    }}
                  >
                    {activeTab === 0 ? 'Create Task' : 'Process Transcript'}
                  </Button>
                </Card>
              )}
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>

      {/* Task Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
                {selectedTask ? 'Edit Task' : 'Create New Task'}
              </h2>
              <TaskForm
                task={selectedTask || undefined}
                onSubmit={selectedTask ? handleUpdateTask : handleCreateTask}
                onCancel={() => {
                  setIsFormOpen(false);
                  setSelectedTask(null);
                }}
                isLoading={isSubmitting}
              />
            </div>
          </div>
        </div>
      )}

      {/* Transcript Form Modal */}
      {isTranscriptFormOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
                Process Transcript
              </h2>
              <TranscriptForm
                onSubmit={handleProcessTranscript}
                isLoading={isSubmitting}
              />
              <div className="flex justify-end mt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsTranscriptFormOpen(false)}
                  className="mr-2"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksPage;
