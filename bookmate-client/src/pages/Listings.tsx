import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ListingDto } from '../api/listings';
import { getAllListings, searchListings } from '../api/listings';

export default function Listings() {
  const navigate = useNavigate();
  const [listings, setListings] = useState<ListingDto[]>([]);
  const [query, setQuery]       = useState('');
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchAll = () => {
    setLoading(true);
    getAllListings()
      .then(res => setListings(res.data))
      .catch(() => setError('Could not load listings.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (!value.trim()) {
        fetchAll();
        return;
      }
      setLoading(true);
      searchListings(value.trim())
        .then(res => setListings(res.data))
        .catch(() => setError('Search failed.'))
        .finally(() => setLoading(false));
    }, 400);
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.heading}>Browse Listings</h2>
          <p style={styles.muted}>{listings.length} listing{listings.length !== 1 ? 's' : ''} available</p>
        </div>
        <button style={styles.createBtn} onClick={() => navigate('/listings/create')}>
          + New Listing
        </button>
      </div>

      <input
        style={styles.search}
        placeholder="Search by book title…"
        value={query}
        onChange={e => handleSearch(e.target.value)}
      />

      {loading ? (
        <p style={styles.muted}>Loading listings…</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : listings.length === 0 ? (
        <div style={styles.empty}><p style={styles.muted}>No listings found.</p></div>
      ) : (
        <div style={styles.grid}>
          {listings.map(l => (
            <ListingCard key={l.id} listing={l} onClick={() => navigate(`/listings/${l.id}`)} />
          ))}
        </div>
      )}
    </div>
  );
}

function ListingCard({ listing, onClick }: { listing: ListingDto; onClick: () => void }) {
  return (
    <div style={cardStyles.card} onClick={onClick}>
      <div style={cardStyles.cover}>
        {listing.coverImage
          ? <img src={listing.coverImage} alt={listing.bookTitle} style={cardStyles.img} />
          : <div style={cardStyles.placeholder}>📖</div>
        }
      </div>
      <div style={cardStyles.body}>
        <p style={cardStyles.title}>{listing.bookTitle}</p>
        <p style={cardStyles.author}>{listing.bookAuthor}</p>
        <div style={cardStyles.tags}>
          <Tag text={listing.condition} color="#6366f1" bg="#eef2ff" />
          <Tag text={listing.exchangeType} color="#059669" bg="#d1fae5" />
        </div>
        <p style={cardStyles.listedBy}>by {listing.userDisplayName}</p>
      </div>
    </div>
  );
}

function Tag({ text, color, bg }: { text: string; color: string; bg: string }) {
  return (
    <span style={{ fontSize: '0.72rem', fontWeight: 600, color, background: bg, borderRadius: 6, padding: '0.2rem 0.5rem' }}>
      {text}
    </span>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page:      { maxWidth: 960, margin: '2rem auto', padding: '0 1rem' },
  header:    { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' },
  heading:   { margin: '0 0 0.25rem', fontSize: '1.5rem', fontWeight: 700 },
  muted:     { color: '#6b7280', fontSize: '0.875rem', margin: 0 },
  createBtn: { background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, padding: '0.5rem 1rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' },
  search:    { width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '0.6rem 0.875rem', fontSize: '0.9rem', outline: 'none', marginBottom: '1.5rem', boxSizing: 'border-box' },
  grid:      { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '1.25rem' },
  empty:     { textAlign: 'center', padding: '3rem 0' },
};

const cardStyles: Record<string, React.CSSProperties> = {
  card:        { background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', cursor: 'pointer', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  cover:       { height: 160, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  img:         { width: '100%', height: '100%', objectFit: 'cover' },
  placeholder: { fontSize: '3rem' },
  body:        { padding: '0.875rem 1rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  title:       { margin: 0, fontWeight: 700, fontSize: '0.95rem', color: '#1a1a1a', lineHeight: 1.3 },
  author:      { margin: 0, fontSize: '0.8rem', color: '#6b7280' },
  tags:        { display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.3rem' },
  listedBy:    { margin: '0.4rem 0 0', fontSize: '0.75rem', color: '#9ca3af' },
};
