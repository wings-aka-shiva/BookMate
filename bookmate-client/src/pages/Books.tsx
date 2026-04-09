import { useEffect, useState } from 'react';
import type { BookDto } from '../api/books';
import { getBooks } from '../api/books';
import BookCard from '../components/BookCard';

export default function Books() {
  const [books, setBooks]   = useState<BookDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    getBooks()
      .then(res => setBooks(res.data))
      .catch(() => setError('Could not load books.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={styles.muted}>Loading books…</p>;
  if (error)   return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2 style={styles.heading}>Browse Books</h2>
        <p style={styles.muted}>{books.length} book{books.length !== 1 ? 's' : ''} available</p>
      </div>

      {books.length === 0 ? (
        <div style={styles.empty}>
          <p style={styles.muted}>No books listed yet.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {books.map(book => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page:    { maxWidth: 960, margin: '2rem auto', padding: '0 1rem' },
  header:  { marginBottom: '1.5rem' },
  heading: { margin: '0 0 0.25rem', fontSize: '1.5rem', fontWeight: 700 },
  muted:   { color: '#6b7280', fontSize: '0.875rem', margin: 0 },
  grid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.25rem' },
  empty:   { textAlign: 'center', padding: '3rem 0' },
};
