interface Props {
  score: number;
}

function getLevel(score: number): { label: string; colour: string } {
  if (score >= 200) return { label: 'Legend', colour: '#f59e0b' };
  if (score >= 100) return { label: 'Trusted', colour: '#10b981' };
  if (score >= 50) return { label: 'Active',  colour: '#6366f1' };
  return               { label: 'New',     colour: '#9ca3af' };
}

export default function ReputationBadge({ score }: Props) {
  const { label, colour } = getLevel(score);

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
      <span
        style={{
          background: colour,
          color: '#fff',
          borderRadius: '999px',
          padding: '0.2rem 0.75rem',
          fontSize: '0.75rem',
          fontWeight: 600,
          letterSpacing: '0.03em',
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 500 }}>
        {score} pts
      </span>
    </div>
  );
}
