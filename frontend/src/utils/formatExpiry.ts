export function formatExpiry(expiresAt: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(expiresAt);
  exp.setHours(0, 0, 0, 0);
  const diffDays = Math.round((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'Expiré';
  if (diffDays === 0) return "Expire aujourd'hui";
  if (diffDays === 1) return 'Expire demain';
  return `Expire dans ${diffDays} jours`;
}
