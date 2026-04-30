export const CURRENCY = '₹';

export function autoTitle(): string {
  const now = new Date();
  const day = now.getDate();
  const month = now.toLocaleString('en-US', { month: 'short' });
  const h = now.getHours();
  const period = h < 12 ? 'Morning' : h < 17 ? 'Afternoon' : h < 21 ? 'Evening' : 'Night';
  return `${day} ${month} · ${period}`;
}

export function fmtDate(d: Date = new Date()): string {
  const day = d.getDate();
  const month = d.toLocaleString('en-US', { month: 'short' });
  const year = String(d.getFullYear()).slice(2);
  return `${day} ${month} '${year}`;
}

export function fmtTime(d: Date = new Date()): string {
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function fmt(n: number): string {
  const v = Math.round(n * 100) / 100;
  return v.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
}

export const ACCENT = '#c8ff3e';
export const ACCENT_INK = '#0f1505';

export const light = {
  bg: '#fafaf7',
  surface: '#ffffff',
  surface2: '#f3f3ef',
  border: 'rgba(15,15,15,0.08)',
  borderStrong: 'rgba(15,15,15,0.14)',
  ink: '#0f0f0f',
  ink2: '#5a5a55',
  ink3: '#98968d',
  neg: '#c2410c',
};

export const darkTheme = {
  bg: '#18181a',
  surface: '#232325',
  surface2: '#2c2c2f',
  border: 'rgba(255,255,255,0.06)',
  borderStrong: 'rgba(255,255,255,0.14)',
  ink: '#f5f5f0',
  ink2: '#a8a8a0',
  ink3: '#6a6a64',
  neg: '#f97316',
};
