import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
  return (
    <div className={`glass-card ${className}`}>
      {title && <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">{title}</h3>}
      {children}
    </div>
  );
};

export default Card;
