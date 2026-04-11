import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ExchangeDto } from '../api/exchanges';
import { getUserExchanges } from '../api/exchanges';
import { useAuth } from '../context/AuthContext';

const STATUS_STYLES: Record<string, { color: string; bg: string }> = {
  Pending:   { color: '#d97706', bg: '#fef3c7' },
  Accepted:  { color: '#059669', bg: '#d1fae5' },
  Completed: { color: '#059669', bg: '#d1fae5' },
  Returned:  { color: '#2563eb', bg: '#dbeafe' },
  Rejected:  { color: '#dc2626', bg: '#fee2e2' },
  Defaulted: { color: '#dc2626', bg: '#fee2e2' },
};

export default function Exchanges() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [exchanges, setExchanges] = useState<ExchangeDto[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  useEffect(() => {
    if (!user) return;
    getUserExchanges(user.userId)
      .then(res => setExchanges(res.data))
      .catch(() => setError('Could not load exchanges.'))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <p style={styles.muted}>Loading exchanges…</p>;
  if (error)   return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2 style={styles.heading}>My Exchanges</h2>
        <p style={styles.muted}>{exchanges.length} exchange{exchanges.length !== 1 ? 's' : ''}</p>
      </div>

      {exchanges.length === 0 ? (
        <div style={styles.empty}>
          <p style={styles.emptyText}>No exchanges yet.</p>
          <p style={styles.muted}>
            Browse listings to request your first book.
          </p>
          <button style={styles.browseBtn} onClick={() => navigate('/listings')}>
            Browse Listings
          </button>
        </div>
      ) : (
        <div style={styles.list}>
          {exchanges.map(ex => (
            <ExchangeCard
              key={ex.id}
              exchange={ex}
              currentUserId={user!.userId}
              onClick={() => navigate(`/exchanges/${ex.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ExchangeCard({
  exchange,
  currentUserId,
  onClick,
}: {
  exchange: ExchangeDto;
  currentUserId: string;
  onClick: () => void;
}) {
  const isRequester  = exchange.requesterId === currentUserId;
  const otherParty   = isRequester ? exchange.ownerName : exchange.requesterName;
  const role         = isRequester ? 'from' : 'to';
  const statusStyle  = STATUS_STYLES[exchange.status] ?? { color: '#6b7280', bg: '#f3f4f6' };

  return (
    <div style={cardStyles.card} onClick={onClick}>
      <div style={cardStyles.left}>
        <p style={cardStyles.title}>{exchange.bookTitle}</p>
        <p style={cardStyles.party}>{role} {otherParty}</p>
        <p style={cardStyles.date}>
          {new Date(exchange.createdAt).toLocaleDateString()}
        </p>
      </div>
      <div style={cardStyles.right}>
        <span style={{ ...cardStyles.typeTag }}>
          {exchange.type}
        </span>
        <span style={{ ...cardStyles.statusTag, color: statusStyle.color, background: statusStyle.bg }}>
          {exchange.status}
        </span>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page:      { maxWidth: 720, margin: '2rem auto', padding: '0 1rem' },
  header:    { marginBottom: '1.5rem' },
  heading:   { margin: '0 0 0.25rem', fontSize: '1.5rem', fontWeight: 700 },
  muted:     { color: '#6b7280', fontSize: '0.875rem', margin: 0 },
  list:      { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  empty:     { textAlign: 'center', padding: '3rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' },
  emptyText: { margin: 0, fontSize: '1rem', fontWeight: 600, color: '#1a1a1a' },
  browseBtn: { marginTop: '0.75rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, padding: '0.55rem 1.25rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' },
};

const cardStyles: Record<string, React.CSSProperties> = {
  card:      { background: '#fff', borderRadius: 12, padding: '1rem 1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' },
  left:      { display: 'flex', flexDirection: 'column', gap: '0.2rem', flex: 1, minWidth: 0 },
  title:     { margin: 0, fontWeight: 700, fontSize: '0.95rem', color: '#1a1a1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  party:     { margin: 0, fontSize: '0.8rem', color: '#6b7280' },
  date:      { margin: 0, fontSize: '0.75rem', color: '#9ca3af' },
  right:     { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem', flexShrink: 0 },
  typeTag:   { fontSize: '0.72rem', fontWeight: 600, color: '#6366f1', background: '#eef2ff', borderRadius: 6, padding: '0.2rem 0.5rem' },
  statusTag: { fontSize: '0.72rem', fontWeight: 600, borderRadius: 6, padding: '0.2rem 0.5rem' },
};
