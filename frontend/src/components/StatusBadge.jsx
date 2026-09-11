export default function StatusBadge({ value }) {
  if (!value) return null
  const label = value.replace(/_/g, ' ')
  return <span className={`badge badge-${value}`}>{label}</span>
}
