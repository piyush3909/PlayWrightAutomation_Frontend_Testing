import { ArrowDownUp, Edit, Trash2 } from 'lucide-react';
import { experienceLabel } from '../utils/studentOptions.js';

export default function StudentTable({ students, canManage, sort, onSort, onOpen, onEdit, onDelete }) {
  // An empty filtered result is different from an empty dataset and gets its own message.
  if (students.length === 0) {
    return (
      <div className="px-4 py-12 text-center sm:px-6" data-testid="empty-state">
        <p className="text-base font-semibold text-slate-950">No students found</p>
        <p className="mt-1 text-sm text-slate-500">Try changing the search or filters.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Desktop and tablet users get the full table layout. */}
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full divide-y divide-slate-200 text-left">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-6 py-3">ID</th>
              <SortableHeader active={sort.key === 'name'} direction={sort.direction} onClick={() => onSort('name')}>
                Name
              </SortableHeader>
              <th className="px-6 py-3">Country</th>
              <SortableHeader active={sort.key === 'experience'} direction={sort.direction} onClick={() => onSort('experience')}>
                Experience
              </SortableHeader>
              <th className="px-6 py-3">Skills</th>
              {canManage && <th className="px-6 py-3 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white text-sm text-slate-700">
            {students.map((student) => (
              <tr
                key={student.id}
                className="cursor-pointer transition hover:bg-teal-50"
                // Clicking a row opens the read-only details modal.
                onClick={() => onOpen(student)}
              >
                <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-950">{student.id}</td>
                <td className="whitespace-nowrap px-6 py-4">{student.name}</td>
                <td className="whitespace-nowrap px-6 py-4">{student.country}</td>
                <td className="whitespace-nowrap px-6 py-4">{experienceLabel(student.experience)}</td>
                <td className="px-6 py-4">
                  <SkillList skills={student.skills} />
                </td>
                {canManage && (
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <ActionButtons student={student} onEdit={onEdit} onDelete={onDelete} />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Small screens use cards so student records stay readable without horizontal scrolling. */}
      <div className="grid gap-3 p-4 md:hidden">
        {students.map((student) => (
          <article
            key={student.id}
            className="rounded-md border border-slate-200 bg-white p-4 shadow-sm"
            onClick={() => onOpen(student)}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{student.id}</p>
                <h3 className="mt-1 text-base font-semibold text-slate-950">{student.name}</h3>
              </div>
              <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                {experienceLabel(student.experience)}
              </span>
            </div>
            <p className="mt-3 text-sm text-slate-600">{student.country}</p>
            <div className="mt-3">
              <SkillList skills={student.skills} />
            </div>
            {canManage && (
              <div className="mt-4 flex justify-end">
                <ActionButtons student={student} onEdit={onEdit} onDelete={onDelete} />
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}

function SortableHeader({ children, active, direction, onClick }) {
  // Header button delegates the actual sort state to Dashboard.
  return (
    <th className="px-6 py-3">
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-2 rounded-sm text-xs font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-teal-500"
      >
        {children}
        <ArrowDownUp className={`h-3.5 w-3.5 ${active ? 'text-teal-700' : ''}`} aria-hidden="true" />
        {active && <span className="sr-only">{direction}</span>}
      </button>
    </th>
  );
}

function SkillList({ skills }) {
  // Skills are rendered as compact chips wherever a student record appears.
  return (
    <div className="flex flex-wrap gap-1.5">
      {skills.map((skill) => (
        <span key={skill} className="rounded-md bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-800">
          {skill}
        </span>
      ))}
    </div>
  );
}

function ActionButtons({ student, onEdit, onDelete }) {
  return (
    // Stop propagation so Edit/Delete do not also trigger the row details modal.
    <div className="inline-flex gap-1" onClick={(event) => event.stopPropagation()}>
      <button
        type="button"
        aria-label={`Edit ${student.name}`}
        title="Edit"
        onClick={() => onEdit(student)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
      >
        <Edit className="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label={`Delete ${student.name}`}
        title="Delete"
        onClick={() => onDelete(student.id)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-200 text-red-700 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
