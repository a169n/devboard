import type { InputHTMLAttributes } from 'react';

export function Field({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="flex flex-col gap-1 text-sm text-slate-700">
      {label}
      <input
        className="rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
        {...props}
      />
    </label>
  );
}
