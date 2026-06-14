// Shared option lists keep filters and forms in sync with the same allowed values.
export const skillOptions = ['React', 'Angular', 'Node.js', 'Java', 'Python'];
export const countryOptions = ['India', 'USA', 'Germany', 'Canada', 'Japan'];
export const experienceOptions = [
  { label: '0-2 Years', value: '0-2', min: 0, max: 2 },
  { label: '3-5 Years', value: '3-5', min: 3, max: 5 },
  { label: '5+ Years', value: '5+', min: 6, max: Number.POSITIVE_INFINITY },
];

export function experienceLabel(years) {
  // Small formatter used anywhere the UI shows a student's experience.
  if (years === 1) {
    return '1 year';
  }
  return `${years} years`;
}
