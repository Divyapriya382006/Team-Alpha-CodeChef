import { useState, type FormEvent } from "react";

interface SearchBarProps {
  defaultValue?: string;
  placeholder?: string;
  onSearch: (value: string) => void;
}

export function SearchBar({ defaultValue = "", placeholder = "Search…", onSearch }: SearchBarProps) {
  const [value, setValue] = useState(defaultValue);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSearch(value.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full gap-2">
      <div className="relative w-full">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
        </svg>
        <input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="field-control pl-9"
        />
      </div>
      <button type="submit" className="btn-primary shrink-0 !px-4">
        Search
      </button>
    </form>
  );
}
