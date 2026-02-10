import React from 'react';
import { AlertCircle } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <AlertCircle className="w-12 h-12" />,
  title,
  description,
  action
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-16 h-16 bg-[#F3F4F6] rounded-full flex items-center justify-center text-[#6B7280] mb-4">
        {icon}
      </div>
      <h3 className="text-[#1F2937] mb-2">{title}</h3>
      {description && (
        <p className="text-[#6B7280] text-center max-w-md mb-6">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
};
