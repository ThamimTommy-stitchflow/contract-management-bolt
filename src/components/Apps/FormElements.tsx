import React from 'react';
import { ChevronDown } from 'lucide-react';

export function FormLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-sm font-semibold text-gray-800 mb-2">
      {children}
    </label>
  );
}

export function FormInput({ 
  type = "text",
  value,
  onChange,
  placeholder,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-700 placeholder-gray-400 bg-white transition-colors duration-200"
      {...props}
    />
  );
}

export function FormTextArea({ 
  value,
  onChange,
  placeholder,
  rows = 4,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-700 placeholder-gray-400 bg-white transition-colors duration-200 resize-none"
      {...props}
    />
  );
}

export function FormSelect({ 
  value,
  onChange,
  options,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { options: string[] }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-700 bg-white appearance-none cursor-pointer transition-colors duration-200 pr-10"
        {...props}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
    </div>
  );
}