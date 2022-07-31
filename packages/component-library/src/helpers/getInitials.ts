export function getInitials(name: string) {
  const parts = name.split(' ');

  if (parts.length === 1) {
    return parts[0].slice(0, 1);
  }
  if (parts.length === 2) {
    return parts[0].slice(0, 1) + parts[1].slice(0, 1);
  }
  if (parts.length > 2) {
    return parts[0].slice(0, 1) + parts[1].slice(0, 1) + parts[2].slice(0, 1);
  }
}
