import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  required?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
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
      <select
        className={`w-full px-4 py-2 border rounded-lg bg-white text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#CF1217] focus:border-transparent transition-all ${
          error ? 'border-[#EF4444]' : 'border-[#E5E7EB]'
        } ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-[#EF4444]">{error}</p>
      )}
    </div>
  );
};
