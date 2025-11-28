import React from 'react';

interface CheckboxGroupProps {
  label?: string;
  options: { value: string; label: string }[];
  value?: string[];
  selectedValues?: string[];
  onChange: (value: string[]) => void;
  columns?: 2 | 3 | 4;
  error?: string;
  helperText?: string;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  label,
  options,
  value,
  selectedValues,
  onChange,
  columns = 2,
  error,
  helperText,
}) => {
  // Soportar ambos: value y selectedValues
  const currentValue = value || selectedValues || [];
  
  const handleChange = (optionValue: string) => {
    if (currentValue.includes(optionValue)) {
      onChange(currentValue.filter((v) => v !== optionValue));
    } else {
      onChange([...currentValue, optionValue]);
    }
  };

  // Clases explícitas para que Tailwind las detecte
  const getGridClass = () => {
    switch (columns) {
      case 2: return 'grid grid-cols-2 gap-2';
      case 3: return 'grid grid-cols-3 gap-2';
      case 4: return 'grid grid-cols-4 gap-2';
      default: return 'grid grid-cols-2 gap-2';
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      {helperText && !error && (
        <p className="mb-2 text-sm text-gray-500">{helperText}</p>
      )}
      <div className={getGridClass()}>
        {options.map((option) => (
          <div
            key={option.value}
            role="checkbox"
            aria-checked={currentValue.includes(option.value)}
            tabIndex={0}
            className={`
              flex items-center p-3 border rounded-lg cursor-pointer transition-all select-none
              ${currentValue.includes(option.value)
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
              }
            `}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleChange(option.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleChange(option.value);
              }
            }}
          >
            <div className={`w-4 h-4 mr-2 rounded border flex items-center justify-center ${
              currentValue.includes(option.value)
                ? 'bg-emerald-500 border-emerald-500'
                : 'border-gray-300'
            }`}>
              {currentValue.includes(option.value) && (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <span className="text-sm font-medium truncate">{option.label}</span>
          </div>
        ))}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};
