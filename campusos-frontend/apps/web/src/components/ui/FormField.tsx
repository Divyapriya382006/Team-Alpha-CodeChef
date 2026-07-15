import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

interface FieldShellProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

function FieldShell({ label, htmlFor, error, hint, children }: FieldShellProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="field-label">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
      {hint && !error && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
      {error && <p className="mt-1.5 text-xs text-rose-400">{error}</p>}
    </div>
  );
}

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  error?: string;
  hint?: string;
}

export function FormField({ label, name, error, hint, className, ...rest }: FormFieldProps) {
  return (
    <FieldShell label={label} htmlFor={name} error={error} hint={hint}>
      <input id={name} name={name} className={`field-control ${className ?? ""}`} {...rest} />
    </FieldShell>
  );
}

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  name: string;
  error?: string;
  hint?: string;
}

export function FormTextarea({ label, name, error, hint, className, ...rest }: FormTextareaProps) {
  return (
    <FieldShell label={label} htmlFor={name} error={error} hint={hint}>
      <textarea id={name} name={name} className={`field-control ${className ?? ""}`} {...rest} />
    </FieldShell>
  );
}

interface FormSelectOption {
  value: string;
  label: string;
}

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  options: FormSelectOption[];
}

export function FormSelect({ label, name, error, hint, options, className, ...rest }: FormSelectProps) {
  return (
    <FieldShell label={label} htmlFor={name} error={error} hint={hint}>
      <select id={name} name={name} className={`field-control ${className ?? ""}`} {...rest}>
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-slate-900">
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}
