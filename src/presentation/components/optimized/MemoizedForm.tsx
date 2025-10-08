// presentation/components/optimized/MemoizedForm.tsx
import React, { memo, useCallback, useMemo } from 'react';
import { ValidationUtils } from '../../../shared/utils/ValidationUtils';

interface FormFieldProps {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'date';
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

const FormField = memo<FormFieldProps>(({
  name,
  label,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  placeholder,
  disabled = false
}) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = ValidationUtils.sanitizeString(e.target.value);
    onChange(sanitizedValue);
  }, [onChange]);

  const inputId = useMemo(() => `${name}-${Math.random().toString(36).substr(2, 9)}`, [name]);

  return (
    <div className="mb-4">
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : 'border-gray-300'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

FormField.displayName = 'FormField';

interface MemoizedFormProps {
  onSubmit: (data: Record<string, string>) => void;
  initialData?: Record<string, string>;
  fields: Array<{
    name: string;
    label: string;
    type?: 'text' | 'email' | 'password' | 'number' | 'date';
    required?: boolean;
    placeholder?: string;
  }>;
  submitLabel?: string;
  loading?: boolean;
  errors?: Record<string, string>;
}

export const MemoizedForm = memo<MemoizedFormProps>(({
  onSubmit,
  initialData = {},
  fields,
  submitLabel = 'Submit',
  loading = false,
  errors = {}
}) => {
  const [formData, setFormData] = React.useState<Record<string, string>>(initialData);

  const handleFieldChange = useCallback((name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  }, [onSubmit, formData]);

  const memoizedFields = useMemo(() => fields, [fields]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {memoizedFields.map((field) => (
        <FormField
          key={field.name}
          name={field.name}
          label={field.label}
          type={field.type}
          value={formData[field.name] || ''}
          onChange={(value) => handleFieldChange(field.name, value)}
          error={errors[field.name]}
          required={field.required}
          placeholder={field.placeholder}
          disabled={loading}
        />
      ))}

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-2 px-4 rounded-md font-medium ${loading
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
          } text-white transition-colors`}
      >
        {loading ? 'Loading...' : submitLabel}
      </button>
    </form>
  );
});

MemoizedForm.displayName = 'MemoizedForm';
