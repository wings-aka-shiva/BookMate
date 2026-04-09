import { useNavigate } from 'react-router-dom';
import type { BookDto } from '../api/books';

interface Props {
  book: BookDto;
}

export default function BookCard({ book }: Props) {
  const navigate = useNavigate();

  return (
    <div style={styles.card} onClick={() => navigate(`/books/${book.id}`)}>
      <div style={styles.cover}>
        {book.coverImage
          ? <img src={book.coverImage} alt={book.title} style={styles.img} />
          : <div style={styles.placeholder}>📖</div>
        }
      </div>
      <div style={styles.body}>
        <p style={styles.title}>{book.title}</p>
        <p style={styles.author}>{book.author}</p>
        <span style={styles.genre}>{book.genre}</span>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card:        { background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', cursor: 'pointer', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.15s' },
  cover:       { height: 160, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  img:         { width: '100%', height: '100%', objectFit: 'cover' },
  placeholder: { fontSize: '3rem' },
  body:        { padding: '0.875rem 1rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' },
  title:       { margin: 0, fontWeight: 700, fontSize: '0.95rem', color: '#1a1a1a', lineHeight: 1.3 },
  author:      { margin: 0, fontSize: '0.8rem', color: '#6b7280' },
  genre:       { marginTop: '0.4rem', fontSize: '0.72rem', fontWeight: 600, color: '#6366f1', background: '#eef2ff', borderRadius: 6, padding: '0.2rem 0.5rem', alignSelf: 'flex-start' },
};
