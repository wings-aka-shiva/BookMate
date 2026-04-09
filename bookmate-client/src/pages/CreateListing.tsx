import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { BookDto } from '../api/books';
import { getBooks } from '../api/books';
import { createListing } from '../api/listings';
import api from '../api/axios';

// inline search — reuse getBooks with search param
const searchBooks = (query: string) =>
  api.get<BookDto[]>('/books', { params: { search: query } });

const CONDITIONS    = ['Poor', 'Fair', 'Good', 'Very Good', 'Like New'];
const EXCHANGE_TYPES = ['Swap', 'Temporary', 'Pass It On'];

export default function CreateListing() {
  const navigate = useNavigate();

  const [bookQuery, setBookQuery]         = useState('');
  const [bookResults, setBookResults]     = useState<BookDto[]>([]);
  const [selectedBook, setSelectedBook]   = useState<BookDto | null>(null);
  const [showDropdown, setShowDropdown]   = useState(false);
  const [condition, setCondition]         = useState('');
  const [exchangeType, setExchangeType]   = useState('');
  const [submitting, setSubmitting]       = useState(false);
  const [success, setSuccess]             = useState('');
  const [error, setError]                 = useState('');
  const [validationErr, setValidationErr] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleBookSearch = (value: string) => {
    setBookQuery(value);
    setSelectedBook(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value.trim()) {
      setBookResults([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await searchBooks(value.trim());
        setBookResults(res.data);
        setShowDropdown(true);
      } catch {
        // silently ignore search errors
      }
    }, 400);
  };

  const selectBook = (book: BookDto) => {
    setSelectedBook(book);
    setBookQuery(book.title);
    setBookResults([]);
    setShowDropdown(false);
  };

  const clearBook = () => {
    setSelectedBook(null);
    setBookQuery('');
    setBookResults([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErr('');
    setError('');

    if (!selectedBook) { setValidationErr('Please select a book from the search results.'); return; }
    if (!condition)    { setValidationErr('Please select a condition.'); return; }
    if (!exchangeType) { setValidationErr('Please select an exchange type.'); return; }

    setSubmitting(true);
    try {
      await createListing({ bookId: selectedBook.id, condition, exchangeType });
      setSuccess('Listing created successfully!');
      setTimeout(() => navigate('/listings'), 1200);
    } catch {
      setError('Failed to create listing. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Load all books on initial focus if query is empty
  const handleBookFocus = async () => {
    if (!bookQuery.trim() && !selectedBook) {
      try {
        const res = await getBooks();
        setBookResults(res.data);
        setShowDropdown(true);
      } catch {
        // ignore
      }
    }
  };

  return (
    <div style={styles.page}>
      <button style={styles.back} onClick={() => navigate(-1)}>← Back</button>

      <div style={styles.card}>
        <h2 style={styles.heading}>Create a Listing</h2>
        <p style={styles.muted}>List a book you want to swap, lend, or pass on.</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Book search */}
          <div style={styles.field}>
            <label style={styles.label}>Book</label>
            {selectedBook ? (
              <div style={styles.selectedBook}>
                <span style={styles.selectedTitle}>{selectedBook.title}</span>
                <span style={styles.selectedAuthor}>by {selectedBook.author}</span>
                <button type="button" style={styles.clearBtn} onClick={clearBook}>✕ Change</button>
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                <input
                  style={styles.input}
                  placeholder="Search for a book by title…"
                  value={bookQuery}
                  onChange={e => handleBookSearch(e.target.value)}
                  onFocus={handleBookFocus}
                  autoComplete="off"
                />
                {showDropdown && bookResults.length > 0 && (
                  <div style={styles.dropdown}>
                    {bookResults.map(book => (
                      <div
                        key={book.id}
                        style={styles.dropdownItem}
                        onMouseDown={() => selectBook(book)}
                      >
                        <span style={styles.dropTitle}>{book.title}</span>
                        <span style={styles.dropAuthor}>{book.author}</span>
                      </div>
                    ))}
                  </div>
                )}
                {showDropdown && bookResults.length === 0 && bookQuery.trim() && (
                  <div style={styles.dropdown}>
                    <div style={{ ...styles.dropdownItem, color: '#9ca3af' }}>No books found.</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Condition */}
          <div style={styles.field}>
            <label style={styles.label}>Condition</label>
            <select
              style={styles.input}
              value={condition}
              onChange={e => setCondition(e.target.value)}
            >
              <option value="">Select condition…</option>
              {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Exchange type */}
          <div style={styles.field}>
            <label style={styles.label}>Exchange Type</label>
            <select
              style={styles.input}
              value={exchangeType}
              onChange={e => setExchangeType(e.target.value)}
            >
              <option value="">Select type…</option>
              {EXCHANGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {validationErr && <p style={styles.validationErr}>{validationErr}</p>}
          {error         && <p style={styles.errorMsg}>{error}</p>}
          {success       && <p style={styles.successMsg}>{success}</p>}

          <button type="submit" style={styles.submitBtn} disabled={submitting}>
            {submitting ? 'Creating…' : 'Create Listing'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page:          { maxWidth: 560, margin: '2rem auto', padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  back:          { background: 'none', border: 'none', cursor: 'pointer', color: '#6366f1', fontWeight: 600, fontSize: '0.875rem', padding: 0, alignSelf: 'flex-start' },
  card:          { background: '#fff', borderRadius: 12, padding: '1.75rem', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  heading:       { margin: '0 0 0.25rem', fontSize: '1.25rem', fontWeight: 700 },
  muted:         { color: '#6b7280', fontSize: '0.875rem', margin: '0 0 1.5rem' },
  form:          { display: 'flex', flexDirection: 'column', gap: '1.1rem' },
  field:         { display: 'flex', flexDirection: 'column', gap: '0.35rem' },
  label:         { fontSize: '0.8rem', fontWeight: 600, color: '#374151' },
  input:         { border: '1px solid #e5e7eb', borderRadius: 8, padding: '0.55rem 0.75rem', fontSize: '0.9rem', outline: 'none', width: '100%', boxSizing: 'border-box' },
  dropdown:      { position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 50, maxHeight: 220, overflowY: 'auto' },
  dropdownItem:  { padding: '0.65rem 0.875rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.1rem', borderBottom: '1px solid #f3f4f6' },
  dropTitle:     { fontSize: '0.9rem', fontWeight: 600, color: '#1a1a1a' },
  dropAuthor:    { fontSize: '0.78rem', color: '#6b7280' },
  selectedBook:  { background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '0.6rem 0.875rem', display: 'flex', alignItems: 'center', gap: '0.75rem' },
  selectedTitle: { fontWeight: 600, fontSize: '0.9rem', color: '#1a1a1a', flex: 1 },
  selectedAuthor:{ fontSize: '0.8rem', color: '#6b7280' },
  clearBtn:      { background: 'none', border: 'none', color: '#6366f1', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem', whiteSpace: 'nowrap' },
  validationErr: { color: '#d97706', fontSize: '0.85rem', margin: 0 },
  errorMsg:      { color: '#ef4444', fontSize: '0.85rem', margin: 0 },
  successMsg:    { color: '#059669', fontSize: '0.85rem', margin: 0, fontWeight: 600 },
  submitBtn:     { background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, padding: '0.65rem', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', marginTop: '0.25rem' },
};
