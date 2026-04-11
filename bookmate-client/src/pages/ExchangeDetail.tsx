import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { ExchangeDto } from '../api/exchanges';
import {
  getExchange,
  acceptExchange,
  rejectExchange,
  setPickup,
  confirmHandoverByOwner,
  confirmHandoverByRequester,
  confirmReturnByRequester,
  confirmReturnByOwner,
} from '../api/exchanges';
import { useAuth } from '../context/AuthContext';

const PICKUP_OPTIONS = [
  'Victoria State Library',
  'Flinders Street Station',
  'Meet at my location',
  'HQ Dropoff',
];

const STATUS_STYLES: Record<string, { color: string; bg: string }> = {
  Pending:    { color: '#d97706', bg: '#fef3c7' },
  Accepted:   { color: '#059669', bg: '#d1fae5' },
  InProgress: { color: '#2563eb', bg: '#dbeafe' },
  Completed:  { color: '#059669', bg: '#d1fae5' },
  Returned:   { color: '#2563eb', bg: '#dbeafe' },
  Rejected:   { color: '#dc2626', bg: '#fee2e2' },
  Defaulted:  { color: '#dc2626', bg: '#fee2e2' },
};

export default function ExchangeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [exchange, setExchange]             = useState<ExchangeDto | null>(null);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState('');
  const [actionError, setActionError]       = useState('');
  const [busy, setBusy]                     = useState(false);
  const [pickupLocation, setPickupLocation] = useState(PICKUP_OPTIONS[0]);
  const [returnLocation, setReturnLocation] = useState(PICKUP_OPTIONS[0]);

  const load = async () => {
    if (!id) return;
    try {
      const res = await getExchange(id);
      setExchange(res.data);
    } catch {
      setError('Exchange not found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const run = async (action: () => Promise<unknown>) => {
    setBusy(true);
    setActionError('');
    try {
      await action();
      await load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: string } })?.response?.data;
      setActionError(typeof msg === 'string' ? msg : 'Action failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  if (loading)   return <p style={styles.muted}>Loading…</p>;
  if (error)     return <p style={{ color: 'red' }}>{error}</p>;
  if (!exchange) return null;

  const currentUserId = user?.userId ?? '';
  const isOwner       = exchange.ownerId === currentUserId;
  const isRequester   = exchange.requesterId === currentUserId;
  const otherParty    = isRequester ? exchange.ownerName : exchange.requesterName;
  const statusStyle   = STATUS_STYLES[exchange.status] ?? { color: '#6b7280', bg: '#f3f4f6' };

  // Derive which action panel to show
  const showAcceptReject =
    isOwner && exchange.status === 'Pending';

  const showSetPickup =
    isOwner && exchange.status === 'Accepted' && !exchange.pickupLocation;

  const showOwnerHandover =
    isOwner && exchange.status === 'Accepted' && !!exchange.pickupLocation && !exchange.handoverConfirmedByOwner;

  const showOwnerHandoverWaiting =
    isOwner && exchange.status === 'Accepted' &&
    exchange.handoverConfirmedByOwner && !exchange.handoverConfirmedByRequester;

  const showRequesterHandover =
    isRequester && exchange.status === 'Accepted' &&
    exchange.handoverConfirmedByOwner && !exchange.handoverConfirmedByRequester;

  const showRequesterReturn =
    isRequester && exchange.status === 'InProgress' && !exchange.returnConfirmedByRequester;

  const showRequesterReturnWaiting =
    isRequester && exchange.status === 'InProgress' && exchange.returnConfirmedByRequester;

  const showOwnerReturnConfirm =
    isOwner && exchange.status === 'InProgress' &&
    exchange.returnConfirmedByRequester && !exchange.returnConfirmedByOwner;

  const hasActions =
    showAcceptReject || showSetPickup || showOwnerHandover || showOwnerHandoverWaiting ||
    showRequesterHandover || showRequesterReturn || showRequesterReturnWaiting || showOwnerReturnConfirm;

  return (
    <div style={styles.page}>
      <button style={styles.back} onClick={() => navigate('/exchanges')}>← Back</button>

      {/* Main details card */}
      <div style={styles.card}>
        <div style={styles.titleRow}>
          <h2 style={styles.title}>{exchange.bookTitle}</h2>
          <span style={{ ...styles.statusTag, color: statusStyle.color, background: statusStyle.bg }}>
            {exchange.status}
          </span>
        </div>

        <div style={styles.metaGrid}>
          <Field label="Type"     value={exchange.type} />
          <Field label={isRequester ? 'Owner' : 'Requester'} value={otherParty} />
          <Field label="Created"  value={new Date(exchange.createdAt).toLocaleDateString()} />
          {exchange.completedAt && (
            <Field label="Completed" value={new Date(exchange.completedAt).toLocaleDateString()} />
          )}
          {exchange.pickupLocation && (
            <Field label="Pickup"    value={exchange.pickupLocation} />
          )}
          {exchange.dueDate && (
            <Field label="Due"       value={new Date(exchange.dueDate).toLocaleDateString()} />
          )}
          {exchange.returnLocation && (
            <Field label="Return location" value={exchange.returnLocation} />
          )}
          {exchange.rejectionReason && (
            <Field label="Rejection reason" value={exchange.rejectionReason} />
          )}
        </div>
      </div>

      {/* Action card */}
      {(isOwner || isRequester) && hasActions && (
        <div style={styles.card}>
          {actionError && <p style={styles.actionError}>{actionError}</p>}

          {/* Owner + Pending → Accept / Reject */}
          {showAcceptReject && (
            <div style={styles.actionRow}>
              <p style={styles.actionLabel}>Respond to this request</p>
              <div style={styles.btnGroup}>
                <button style={styles.acceptBtn} disabled={busy}
                  onClick={() => run(() => acceptExchange(exchange.id))}>
                  {busy ? '…' : 'Accept'}
                </button>
                <button style={styles.rejectBtn} disabled={busy}
                  onClick={() => run(() => rejectExchange(exchange.id))}>
                  {busy ? '…' : 'Reject'}
                </button>
              </div>
            </div>
          )}

          {/* Owner + Accepted + no pickup → Set Pickup */}
          {showSetPickup && (
            <div style={styles.actionRow}>
              <p style={styles.actionLabel}>Set a pickup location</p>
              <div style={styles.pickupRow}>
                <select style={styles.select} value={pickupLocation}
                  onChange={e => setPickupLocation(e.target.value)}>
                  {PICKUP_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <button style={styles.confirmBtn} disabled={busy}
                  onClick={() => run(() => setPickup(exchange.id, pickupLocation))}>
                  {busy ? '…' : 'Confirm Pickup'}
                </button>
              </div>
            </div>
          )}

          {/* Owner + Accepted + not yet confirmed handover */}
          {showOwnerHandover && (
            <div style={styles.actionRow}>
              <p style={styles.actionLabel}>Have you handed over the book?</p>
              <button style={styles.confirmBtn} disabled={busy}
                onClick={() => run(() => confirmHandoverByOwner(exchange.id))}>
                {busy ? '…' : 'I handed over the book'}
              </button>
            </div>
          )}

          {/* Owner waiting for requester to confirm receipt */}
          {showOwnerHandoverWaiting && (
            <p style={styles.waitingMsg}>
              Waiting for {exchange.requesterName} to confirm they received the book.
            </p>
          )}

          {/* Requester + Accepted + owner confirmed → confirm receipt */}
          {showRequesterHandover && (
            <div style={styles.actionRow}>
              <p style={styles.actionLabel}>Have you received the book?</p>
              <button style={styles.confirmBtn} disabled={busy}
                onClick={() => run(() => confirmHandoverByRequester(exchange.id))}>
                {busy ? '…' : 'I received the book'}
              </button>
            </div>
          )}

          {/* Requester + InProgress + not yet confirmed return */}
          {showRequesterReturn && (
            <div style={styles.actionRow}>
              <p style={styles.actionLabel}>Ready to return the book?</p>
              <div style={styles.pickupRow}>
                <select style={styles.select} value={returnLocation}
                  onChange={e => setReturnLocation(e.target.value)}>
                  {PICKUP_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <button style={styles.returnBtn} disabled={busy}
                  onClick={() => run(() => confirmReturnByRequester(exchange.id, returnLocation))}>
                  {busy ? '…' : 'I returned the book'}
                </button>
              </div>
            </div>
          )}

          {/* Requester waiting for owner to confirm receipt of return */}
          {showRequesterReturnWaiting && (
            <p style={styles.waitingMsg}>
              Waiting for owner to confirm they received the book back.
            </p>
          )}

          {/* Owner + InProgress + requester confirmed return */}
          {showOwnerReturnConfirm && (
            <div style={styles.actionRow}>
              <p style={styles.actionLabel}>Have you received the book back?</p>
              <button style={styles.confirmBtn} disabled={busy}
                onClick={() => run(() => confirmReturnByOwner(exchange.id))}>
                {busy ? '…' : 'I received the book back'}
              </button>
            </div>
          )}
        </div>
      )}
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
  page:        { maxWidth: 640, margin: '2rem auto', padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  back:        { background: 'none', border: 'none', cursor: 'pointer', color: '#6366f1', fontWeight: 600, fontSize: '0.875rem', padding: 0, alignSelf: 'flex-start' },
  card:        { background: '#fff', borderRadius: 12, padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  titleRow:    { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem' },
  title:       { margin: 0, fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.2 },
  statusTag:   { fontSize: '0.78rem', fontWeight: 600, borderRadius: 6, padding: '0.3rem 0.7rem', whiteSpace: 'nowrap', flexShrink: 0 },
  metaGrid:    { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  muted:       { color: '#6b7280', fontSize: '0.875rem', margin: 0 },
  actionRow:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' },
  actionLabel: { margin: 0, fontSize: '0.9rem', color: '#374151', fontWeight: 500 },
  actionError: { color: '#dc2626', fontSize: '0.85rem', margin: '0 0 1rem' },
  waitingMsg:  { margin: 0, fontSize: '0.875rem', color: '#6b7280', fontStyle: 'italic' },
  btnGroup:    { display: 'flex', gap: '0.6rem' },
  acceptBtn:   { background: '#059669', color: '#fff', border: 'none', borderRadius: 8, padding: '0.5rem 1.1rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' },
  rejectBtn:   { background: '#fff', color: '#dc2626', border: '1px solid #dc2626', borderRadius: 8, padding: '0.5rem 1.1rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' },
  pickupRow:   { display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' },
  select:      { border: '1px solid #e5e7eb', borderRadius: 8, padding: '0.5rem 0.75rem', fontSize: '0.875rem', outline: 'none' },
  confirmBtn:  { background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, padding: '0.5rem 1.1rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' },
  returnBtn:   { background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '0.5rem 1.1rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' },
};
