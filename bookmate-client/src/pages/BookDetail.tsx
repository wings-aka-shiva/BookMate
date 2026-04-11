import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { BookDto } from '../api/books';
import type { ListingDto } from '../api/listings';
import { getBook } from '../api/books';
import api from '../api/axios';

const getBookListings = (bookId: string) =>
  api.get<ListingDto[]>(`/books/${bookId}/listings`);

export default function BookDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [book, setBook]         = useState<BookDto | null>(null);
  const [listings, setListings] = useState<ListingDto[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    if (!id) return;
    Promise.all([getBook(id), getBookListings(id)])
      .then(([bookRes, listingsRes]) => {
        setBook(bookRes.data);
        setListings(listingsRes.data);
      })
      .catch(() => setError('Book not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p style={styles.muted}>Loading…</p>;
  if (error)   return <p style={{ color: 'red' }}>{error}</p>;
  if (!book)   return null;

  return (
    <div style={styles.page}>
      <button style={styles.back} onClick={() => navigate(-1)}>← Back</button>

      <div style={styles.card}>
        <div style={styles.layout}>
          <div style={styles.coverWrap}>
            {book.coverImage
              ? <img src={book.coverImage} alt={book.title} style={styles.cover} />
              : <div style={styles.coverPlaceholder}>📖</div>
            }
          </div>

          <div style={styles.info}>
            <h2 style={styles.title}>{book.title}</h2>
            <p style={styles.author}>by {book.author}</p>

            <div style={styles.tagRow}>
              <span style={styles.genreTag}>{book.genre}</span>
            </div>

            <div style={styles.metaGrid}>
              <Field label="ISBN"      value={book.isbn} />
              <Field label="Published" value={String(book.publishedYear)} />
            </div>
          </div>
        </div>
      </div>

      <div style={styles.card}>
        <h3 style={styles.sectionTitle}>
          Active Listings
          {listings.length > 0 && (
            <span style={styles.count}>{listings.length}</span>
          )}
        </h3>

        {listings.length === 0 ? (
          <p style={styles.muted}>No active listings for this book yet.</p>
        ) : (
          <div style={styles.listingList}>
            {listings.map(l => (
              <div
                key={l.id}
                style={styles.listingCard}
                onClick={() => navigate(`/listings/${l.id}`)}
              >
                <div style={styles.listingLeft}>
                  <p style={styles.listingOwner}>{l.userDisplayName}</p>
                  <p style={styles.listingDate}>
                    Listed {new Date(l.listedAt).toLocaleDateString()}
                  </p>
                </div>
                <div style={styles.listingRight}>
                  <Tag text={l.condition}    color="#6366f1" bg="#eef2ff" />
                  <Tag text={l.exchangeType} color="#059669" bg="#d1fae5" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={styles.card}>
        <h3 style={styles.sectionTitle}>Reading Groups</h3>
        <p style={styles.muted}>No reading groups yet for this book.</p>
      </div>
    </div>
  );
}

function Tag({ text, color, bg }: { text: string; color: string; bg: string }) {
  return (
    <span style={{ fontSize: '0.72rem', fontWeight: 600, color, background: bg, borderRadius: 6, padding: '0.2rem 0.5rem', whiteSpace: 'nowrap' as const }}>
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
  info:            { display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 },
  title:           { margin: 0, fontSize: '1.4rem', fontWeight: 700, lineHeight: 1.2 },
  author:          { margin: 0, color: '#6b7280', fontSize: '0.95rem' },
  tagRow:          { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  genreTag:        { fontSize: '0.75rem', fontWeight: 600, color: '#6366f1', background: '#eef2ff', borderRadius: 6, padding: '0.25rem 0.6rem' },
  metaGrid:        { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' },
  muted:           { color: '#6b7280', fontSize: '0.875rem', margin: 0 },
  sectionTitle:    { margin: '0 0 1rem', fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' },
  count:           { background: '#6366f1', color: '#fff', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700, padding: '0.1rem 0.5rem' },
  listingList:     { display: 'flex', flexDirection: 'column', gap: '0.6rem' },
  listingCard:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', background: '#f9fafb', borderRadius: 8, cursor: 'pointer', border: '1px solid #e5e7eb' },
  listingLeft:     { display: 'flex', flexDirection: 'column', gap: '0.15rem' },
  listingOwner:    { margin: 0, fontWeight: 600, fontSize: '0.9rem', color: '#1a1a1a' },
  listingDate:     { margin: 0, fontSize: '0.75rem', color: '#9ca3af' },
  listingRight:    { display: 'flex', gap: '0.4rem', flexShrink: 0 },
};
