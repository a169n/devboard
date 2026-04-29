import type { InputHTMLAttributes } from 'react';

export function Field({
  label,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="flex flex-col gap-1 text-sm text-foreground">
      {label}
      <input
        className="rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
        {...props}
      />
    </label>
  );
}
