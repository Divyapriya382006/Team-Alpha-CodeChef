import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useClubDepartments, useCreateDepartment } from "../../../hooks/useDepartments";
import { FormField } from "../../../components/ui/FormField";
import { Skeleton } from "../../../components/ui/Skeleton";
import { ApiError } from "../../../lib/apiError";

interface DepartmentsSectionProps {
  clubId: string;
}

export function DepartmentsSection({ clubId }: DepartmentsSectionProps) {
  const departmentsQuery = useClubDepartments(clubId);
  const createDepartment = useCreateDepartment(clubId);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createDepartment.mutateAsync(name);
      setName("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create department");
    }
  }

  return (
    <div className="surface p-6">
      <h2 className="text-base font-semibold">Departments</h2>

      {departmentsQuery.isLoading ? (
        <div className="mt-3 space-y-2">
          <Skeleton className="h-8 w-1/2" />
        </div>
      ) : departmentsQuery.data && departmentsQuery.data.length > 0 ? (
        <ul className="mt-3 divide-y divide-slate-800">
          {departmentsQuery.data.map((d) => (
            <li key={d.id} className="flex items-center justify-between py-2 text-sm">
              <span className="text-ink">{d.name}</span>
              <Link to={`/clubs/${clubId}/manage/departments/${d.id}`} className="text-brand-400 hover:text-brand-300">
                Manage
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted">No departments yet.</p>
      )}

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1">
          <FormField
            label="New department"
            name="departmentName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={error ?? undefined}
            minLength={2}
            maxLength={50}
          />
        </div>
        <button type="submit" disabled={createDepartment.isPending || name.trim().length < 2} className="btn-primary shrink-0">
          {createDepartment.isPending ? "Creating…" : "Create"}
        </button>
      </form>
    </div>
  );
}
