import React from 'react';
import { FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="glass mt-12 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-700 dark:text-gray-300">
              &copy; {currentYear} Task Manager. All rights reserved.
            </p>
          </div>
          
          <div className="flex space-x-4">
            <a 
              href="#" 
              className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
              aria-label="GitHub"
            >
              <FaGithub size={20} />
            </a>
            <a 
              href="#" 
              className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
              aria-label="Twitter"
            >
              <FaTwitter size={20} />
            </a>
            <a 
              href="#" 
              className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
              aria-label="LinkedIn"
            >
              <FaLinkedin size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
