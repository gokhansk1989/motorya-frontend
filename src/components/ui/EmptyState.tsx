export function EmptyState({ icon, title, sub, compact }: { icon: React.ReactNode; title: string; sub?: string; compact?: boolean }) {
  return (
    <div style={{ textAlign: 'center', padding: compact ? '32px 0' : '80px 0', color: 'var(--ink-3)' }}>
      <div style={{ opacity: 0.25, color: 'var(--ink-3)', display: 'flex', justifyContent: 'center', marginBottom: compact ? 8 : 14 }}>{icon}</div>
      <p style={{ fontSize: compact ? 14 : 16, fontWeight: 600, marginBottom: sub ? 6 : 0, color: 'var(--ink-2)' }}>{title}</p>
      {sub && <p style={{ fontSize: 13 }}>{sub}</p>}
    </div>
  );
}
