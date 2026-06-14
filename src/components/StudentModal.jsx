import { Edit, X } from 'lucide-react';
import { experienceLabel } from '../utils/studentOptions.js';

export default function StudentModal({ student, canManage, onClose, onEdit }) {
  // No selected student means the details modal should not render.
  if (!student) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/50 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg rounded-md bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">{student.id}</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950">{student.name}</h2>
          </div>
          <button
            type="button"
            aria-label="Close student details"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <Detail label="Country" value={student.country} />
          <Detail label="Experience" value={experienceLabel(student.experience)} />
          <div className="sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Skills</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {student.skills.map((skill) => (
                <span key={skill} className="rounded-md bg-teal-50 px-2 py-1 text-sm font-semibold text-teal-800">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-200 p-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            Close
          </button>
          {/* Only admins can jump from details into the edit form. */}
          {canManage && (
            <button
              type="button"
              onClick={() => onEdit(student)}
              className="inline-flex items-center gap-2 rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <Edit className="h-4 w-4" aria-hidden="true" />
              Edit Student
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  // Reusable label/value block for modal metadata.
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-950">{value}</p>
    </div>
  );
}
