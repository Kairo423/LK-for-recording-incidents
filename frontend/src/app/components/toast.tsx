import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

interface ToastProps {
  type?: 'success' | 'error' | 'info';
  message: string;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ 
  type = 'info',
  message,
  onClose,
  duration = 3000
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onClose]);
  
  const config = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-[#D1FAE5]',
      borderColor: 'border-[#10B981]',
      textColor: 'text-[#10B981]'
    },
    error: {
      icon: AlertCircle,
      bgColor: 'bg-[#FEE2E2]',
      borderColor: 'border-[#EF4444]',
      textColor: 'text-[#EF4444]'
    },
    info: {
      icon: Info,
      bgColor: 'bg-[#E0F2FE]',
      borderColor: 'border-[#3B82F6]',
      textColor: 'text-[#3B82F6]'
    }
  };
  
  const Icon = config[type].icon;
  
  return (
    <div className={`fixed bottom-6 right-6 z-50 max-w-md w-full ${config[type].bgColor} border ${config[type].borderColor} rounded-lg shadow-lg p-4 flex items-start gap-3 animate-slideIn`}>
      <Icon className={`w-5 h-5 ${config[type].textColor} flex-shrink-0 mt-0.5`} />
      <p className="flex-1 text-[#1F2937]">{message}</p>
      <button
        onClick={onClose}
        className="text-[#6B7280] hover:text-[#1F2937] transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};
