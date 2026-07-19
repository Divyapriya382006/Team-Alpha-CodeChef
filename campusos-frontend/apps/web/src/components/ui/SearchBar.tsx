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
    <form onSubmit={handleSubmit} className="flex w-full">
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="field-control border-r-0 rounded-none bg-white text-ink placeholder:text-[#888888]"
      />
      <button type="submit" className="btn-primary shrink-0 !p-2 flex items-center justify-center bg-brand text-ink rounded-none">
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
        </svg>
      </button>
    </form>
  );
}
