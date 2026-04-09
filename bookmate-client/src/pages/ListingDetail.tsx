import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { ListingDto } from '../api/listings';
import { getListingById, deleteListing } from '../api/listings';
import { useAuth } from '../context/AuthContext';

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [listing, setListing]   = useState<ListingDto | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    getListingById(id)
      .then(res => setListing(res.data))
      .catch(() => setError('Listing not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!listing) return;
    setDeleting(true);
    try {
      await deleteListing(listing.id);
      navigate('/listings');
    } catch {
      setError('Failed to delete listing.');
      setDeleting(false);
    }
  };

  if (loading) return <p style={styles.muted}>Loading…</p>;
  if (error)   return <p style={{ color: 'red' }}>{error}</p>;
  if (!listing) return null;

  const isOwner = user?.userId === listing.userId;

  return (
    <div style={styles.page}>
      <button style={styles.back} onClick={() => navigate(-1)}>← Back</button>

      <div style={styles.card}>
        <div style={styles.layout}>
          <div style={styles.coverWrap}>
            {listing.coverImage
              ? <img src={listing.coverImage} alt={listing.bookTitle} style={styles.cover} />
              : <div style={styles.coverPlaceholder}>📖</div>
            }
          </div>

          <div style={styles.info}>
            <h2 style={styles.title}>{listing.bookTitle}</h2>
            <p style={styles.author}>by {listing.bookAuthor}</p>

            <div style={styles.tagRow}>
              <Tag text={listing.condition}   color="#6366f1" bg="#eef2ff" />
              <Tag text={listing.exchangeType} color="#059669" bg="#d1fae5" />
              <Tag text={listing.status}       color={listing.status === 'Active' ? '#d97706' : '#6b7280'} bg={listing.status === 'Active' ? '#fef3c7' : '#f3f4f6'} />
            </div>

            <div style={styles.metaGrid}>
              <Field label="Listed by"  value={listing.userDisplayName} />
              <Field label="Listed at"  value={new Date(listing.listedAt).toLocaleDateString()} />
              <Field label="Expires"    value={new Date(listing.expiresAt).toLocaleDateString()} />
            </div>
          </div>
        </div>
      </div>

      <div style={styles.card}>
        {isOwner ? (
          <div style={styles.actionRow}>
            <p style={styles.ownerNote}>You created this listing.</p>
            <button style={styles.deleteBtn} onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting…' : 'Delete Listing'}
            </button>
          </div>
        ) : (
          <div style={styles.actionRow}>
            <p style={styles.muted}>Interested in this book?</p>
            <button style={styles.requestBtn} disabled>
              Request Exchange
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Tag({ text, color, bg }: { text: string; color: string; bg: string }) {
  return (
    <span style={{ fontSize: '0.75rem', fontWeight: 600, color, background: bg, borderRadius: 6, padding: '0.25rem 0.6rem' }}>
      {text}
    </span>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div style={fieldStyles.wrap}>
      <span style={fieldStyles.label}>{label}</span>
      <span style={fieldStyles.value}>{value}</span>
    </div>
  );
}

const fieldStyles: Record<string, React.CSSProperties> = {
  wrap:  { display: 'flex', flexDirection: 'column', gap: '0.1rem' },
  label: { fontSize: '0.72rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' },
  value: { fontSize: '0.9rem', color: '#1a1a1a' },
};

const styles: Record<string, React.CSSProperties> = {
  page:            { maxWidth: 720, margin: '2rem auto', padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  back:            { background: 'none', border: 'none', cursor: 'pointer', color: '#6366f1', fontWeight: 600, fontSize: '0.875rem', padding: 0, alignSelf: 'flex-start' },
  card:            { background: '#fff', borderRadius: 12, padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  layout:          { display: 'flex', gap: '1.5rem', alignItems: 'flex-start' },
  coverWrap:       { flexShrink: 0 },
  cover:           { width: 130, height: 190, objectFit: 'cover', borderRadius: 8 },
  coverPlaceholder:{ width: 130, height: 190, background: '#f3f4f6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem' },
  info:            { display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1 },
  title:           { margin: 0, fontSize: '1.4rem', fontWeight: 700, lineHeight: 1.2 },
  author:          { margin: 0, color: '#6b7280', fontSize: '0.95rem' },
  tagRow:          { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  metaGrid:        { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginTop: '0.25rem' },
  muted:           { color: '#6b7280', fontSize: '0.875rem', margin: 0 },
  actionRow:       { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  ownerNote:       { color: '#6b7280', fontSize: '0.875rem', margin: 0 },
  deleteBtn:       { background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, padding: '0.5rem 1.25rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' },
  requestBtn:      { background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, padding: '0.5rem 1.25rem', fontWeight: 600, cursor: 'not-allowed', fontSize: '0.875rem', opacity: 0.6 },
};
