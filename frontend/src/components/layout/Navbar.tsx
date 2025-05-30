import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaSun, FaMoon, FaTasks, FaChartLine, FaHome } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';

const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-300';
  };

  return (
    <nav className="glass sticky top-0 z-50 px-4 py-3 mb-8">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <FaTasks className="text-primary-600 dark:text-primary-400 text-2xl" />
          <span className="text-xl font-bold text-gray-800 dark:text-white">Task Manager</span>
        </div>

        <div className="hidden md:flex space-x-16">
          <Link to="/" className={`flex items-center space-x-1 ${isActive('/')}`}>
            <FaHome />
            <span>Home</span>
          </Link>
          <Link to="/dashboard" className={`flex items-center space-x-1 ${isActive('/dashboard')}`}>
            <FaChartLine />
            <span>Dashboard</span>
          </Link>
          <Link to="/tasks" className={`flex items-center space-x-1 ${isActive('/tasks')}`}>
            <FaTasks />
            <span>Tasks</span>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <FaSun className="text-yellow-500" />
            ) : (
              <FaMoon className="text-gray-700" />
            )}
          </button>
          
          {/* Mobile menu button - would implement a dropdown menu for mobile */}
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
