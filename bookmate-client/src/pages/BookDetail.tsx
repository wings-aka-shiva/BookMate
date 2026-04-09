import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { BookDto } from '../api/books';
import { getBook } from '../api/books';

export default function BookDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [book, setBook]       = useState<BookDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (!id) return;
    getBook(id)
      .then(res => setBook(res.data))
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
              <Field label="ISBN"            value={book.isbn} />
              <Field label="Published"       value={String(book.publishedYear)} />
            </div>
          </div>
        </div>
      </div>

      <div style={styles.card}>
        <h3 style={styles.sectionTitle}>Listings</h3>
        <p style={styles.muted}>No listings yet for this book.</p>
      </div>

      <div style={styles.card}>
        <h3 style={styles.sectionTitle}>Reading Groups</h3>
        <p style={styles.muted}>No reading groups yet for this book.</p>
      </div>
    </div>
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
  sectionTitle:    { margin: '0 0 0.75rem', fontSize: '1rem', fontWeight: 600 },
};
