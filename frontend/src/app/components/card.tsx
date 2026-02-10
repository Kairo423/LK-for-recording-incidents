import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  actions?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '',
  title,
  actions
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-[#E5E7EB] ${className}`}>
      {(title || actions) && (
        <div className="px-6 py-4 border-b border-[#E5E7EB] flex justify-between items-center">
          {title && <h3 className="text-[#1F2937]">{title}</h3>}
          {actions && <div>{actions}</div>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};
