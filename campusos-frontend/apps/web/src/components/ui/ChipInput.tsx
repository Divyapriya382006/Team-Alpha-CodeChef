import { useState, type KeyboardEvent } from "react";

interface ChipInputProps {
  label: string;
  name: string;
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  hint?: string;
}

// Free-text tag/name entry — type, press Enter or comma to add, click × to remove.
export function ChipInput({ label, name, value, onChange, placeholder, hint }: ChipInputProps) {
  const [draft, setDraft] = useState("");

  function commitDraft() {
    const trimmed = draft.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setDraft("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commitDraft();
    } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  function removeChip(chip: string) {
    onChange(value.filter((v) => v !== chip));
  }

  return (
    <div>
      <label htmlFor={name} className="field-label">
        {label}
      </label>
      <div className="field-control mt-1.5 flex flex-wrap items-center gap-1.5 py-1.5">
        {value.map((chip) => (
          <span
            key={chip}
            className="inline-flex items-center gap-1 rounded-full bg-brand-500/10 px-2 py-0.5 text-xs text-brand-300 ring-1 ring-inset ring-brand-500/30"
          >
            {chip}
            <button
              type="button"
              onClick={() => removeChip(chip)}
              className="text-brand-400/70 hover:text-brand-200"
              aria-label={`Remove ${chip}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          id={name}
          name={name}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commitDraft}
          placeholder={value.length === 0 ? placeholder : undefined}
          className="min-w-[8rem] flex-1 border-none bg-transparent p-0.5 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:ring-0"
        />
      </div>
      {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
