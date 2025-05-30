import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { FaPlus, FaTasks, FaCheck, FaClock, FaExclamationTriangle } from 'react-icons/fa';
import { taskApi } from '../services/api';
import type { ChartData } from '../types';
import { useTheme } from '../context/ThemeContext';

const DashboardPage: React.FC = () => {
  const { theme } = useTheme();
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState(new Date());

  // Colors for charts
  const COLORS = ['#0284c7', '#7dd3fc', '#38bdf8', '#0ea5e9'];
  const DARK_COLORS = ['#0ea5e9', '#38bdf8', '#7dd3fc', '#0284c7'];
  const chartColors = theme === 'dark' ? DARK_COLORS : COLORS;

  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await taskApi.getTaskStats();
        setChartData(data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Convert daily task counts to calendar events
  const events = chartData?.dailyTaskCounts.map(item => ({
    date: new Date(item.date),
    count: item.count
  })) || [];

  // Custom tile content for calendar
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return null;
    
    const event = events.find(e => 
      e.date.getDate() === date.getDate() && 
      e.date.getMonth() === date.getMonth() && 
      e.date.getFullYear() === date.getFullYear()
    );
    
    if (!event) return null;
    
    return (
      <div className="absolute bottom-1 right-1 flex items-center justify-center w-5 h-5 text-xs rounded-full bg-primary-500 text-white">
        {event.count}
      </div>
    );
  };

  // Calculate completion percentage and task counts
  const completedTasks = chartData?.taskStats?.completed || 0;
  const pendingTasks = chartData?.taskStats?.pending || 0;
  const totalTasks = chartData?.taskStats?.total || 0;
  const overdueTasks = chartData?.taskStats?.overdue || 0;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Format data for task distribution pie chart
  const getTaskDistributionData = () => {
    if (!chartData || !chartData.taskDistribution) return [];
    
    return chartData.taskDistribution.map(item => ({
      name: item.name,
      value: item.value
    }));
  };
  
  // Format data for task status overview
  const getTaskStatusData = () => {
    if (!chartData || !chartData.labels) return [];
    
    return chartData.labels.map((label, index) => ({
      name: label,
      value: chartData.datasets[0]?.data[index] || 0
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
        <Link to="/tasks">
          <Button variant="primary" icon={<FaPlus />}>
            New Task
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Tasks</p>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{totalTasks}</h3>
              <p className="text-gray-500 dark:text-gray-400">Total Tasks</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
              <FaTasks className="text-blue-600 dark:text-blue-400 text-xl" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{completedTasks}</h3>
              <p className="text-gray-500 dark:text-gray-400">Completed Tasks</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
              <FaCheck className="text-green-600 dark:text-green-400 text-xl" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{pendingTasks}</h3>
              <p className="text-gray-500 dark:text-gray-400">Pending Tasks</p>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-full">
              <FaClock className="text-yellow-600 dark:text-yellow-400 text-xl" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-red-800 dark:text-red-400">{overdueTasks}</h3>
              <p className="text-gray-500 dark:text-gray-400">Overdue Tasks</p>
            </div>
            <div className="bg-red-100 dark:bg-red-900 p-3 rounded-full">
              <FaExclamationTriangle className="text-red-600 dark:text-red-400 text-xl" />
            </div>
          </div>
        </Card>
      </div>

      {/* Completion Rate */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Completion Rate</h2>
        <div className="flex items-center">
          <div className="relative w-24 h-24 mr-6">
            <svg className="w-full h-full" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                className="stroke-current text-gray-200 dark:text-gray-700"
                strokeWidth="2"
              ></circle>
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                className="stroke-current text-primary-500"
                strokeWidth="2"
                strokeDasharray="100"
                strokeDashoffset={100 - completionPercentage}
                strokeLinecap="round"
                transform="rotate(-90 18 18)"
              ></circle>
              <text
                x="18"
                y="18"
                dominantBaseline="middle"
                textAnchor="middle"
                className="fill-current text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {completionPercentage}%
              </text>
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-bold">{completionPercentage}%</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {completedTasks} of {totalTasks} tasks completed
            </p>
          </div>
        </div>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Task Overview Chart */}
        <Card className="lg:col-span-2 p-6">
          <h2 className="text-xl font-semibold mb-4">Task Overview</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={getTaskStatusData()}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
                <XAxis 
                  dataKey="name" 
                  stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} 
                />
                <YAxis stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                    borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                    color: theme === 'dark' ? '#ffffff' : '#000000'
                  }}
                  formatter={(value) => [`${value} tasks`]}
                />
                <Bar 
                  dataKey="value" 
                  name="Tasks" 
                  fill="#0ea5e9" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Task Distribution */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Task Distribution</h2>
          <div className="h-50">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={getTaskDistributionData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getTaskDistributionData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value} tasks`, 'Count']}
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                    borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                    color: theme === 'dark' ? '#ffffff' : '#000000'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="mt-16">
              <h3 className="text-lg font-medium mb-2">Task Status</h3>
              <div className="space-y-2">
                {chartData?.labels.map((label, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="capitalize">{label.replace('_', ' ')}</span>
                    <span className="font-medium">
                      {chartData?.datasets[0]?.data[index] || 0} tasks
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
