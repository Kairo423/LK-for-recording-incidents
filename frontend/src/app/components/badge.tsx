import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'in-progress' | 'completed' | 'critical' | 'default';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'default',
  className = '' 
}) => {
  const variantStyles = {
    'in-progress': 'bg-[#FEF3C7] text-[#F59E0B] border-[#FDE68A]',
    'completed': 'bg-[#D1FAE5] text-[#10B981] border-[#A7F3D0]',
    'critical': 'bg-[#FEE2E2] text-[#EF4444] border-[#FECACA]',
    'default': 'bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]'
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-sm ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};
