import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  required,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block mb-1.5 text-[#1F2937]">
          {label}
          {required && <span className="text-[#CF1217] ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          className={`w-full px-4 py-2 border rounded-lg bg-white text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#CF1217] focus:border-transparent transition-all ${
            error ? 'border-[#EF4444]' : 'border-[#E5E7EB]'
          } ${icon ? 'pr-10' : ''} ${className}`}
          {...props}
        />
        {icon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280]">
            {icon}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-[#EF4444]">{error}</p>
      )}
    </div>
  );
};
