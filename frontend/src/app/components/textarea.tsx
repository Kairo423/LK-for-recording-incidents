import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  required?: boolean;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
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
      <textarea
        className={`w-full px-4 py-2 border rounded-lg bg-white text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#CF1217] focus:border-transparent transition-all resize-y ${
          error ? 'border-[#EF4444]' : 'border-[#E5E7EB]'
        } ${className}`}
        rows={4}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-[#EF4444]">{error}</p>
      )}
    </div>
  );
};
