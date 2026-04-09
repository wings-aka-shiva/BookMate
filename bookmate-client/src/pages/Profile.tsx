import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { UserDto, UserStatsDto, UpdateUserDto } from '../api/users';
import { getProfile, getStats, updateProfile } from '../api/users';
import ReputationBadge from '../components/ReputationBadge';

export default function Profile() {
  const { id } = useParams<{ id: string }>();

  const [user, setUser]   = useState<UserDto | null>(null);
  const [stats, setStats] = useState<UserStatsDto | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<UpdateUserDto>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([getProfile(id), getStats(id)])
      .then(([profileRes, statsRes]) => {
        setUser(profileRes.data);
        setStats(statsRes.data);
        setForm({
          displayName: profileRes.data.displayName,
          phone: profileRes.data.phone,
          visaStatus: profileRes.data.visaStatus ?? '',
        });
      })
      .catch(() => setError('Could not load profile.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await updateProfile(id, form);
      const refreshed = await getProfile(id);
      setUser(refreshed.data);
      setEditing(false);
    } catch {
      setError('Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p style={styles.muted}>Loading profile…</p>;
  if (error)   return <p style={{ color: 'red' }}>{error}</p>;
  if (!user)   return null;

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.headerRow}>
          <div>
            <h2 style={styles.name}>{user.displayName || user.name}</h2>
            <p style={styles.muted}>{user.email}</p>
            <div style={{ marginTop: '0.5rem' }}>
              <ReputationBadge score={user.reputationScore} />
            </div>
          </div>
          <button style={styles.editBtn} onClick={() => setEditing(!editing)}>
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {editing && (
          <div style={styles.editForm}>
            <label style={styles.label}>Display Name</label>
            <input
              style={styles.input}
              value={form.displayName ?? ''}
              onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
            />

            <label style={styles.label}>Phone</label>
            <input
              style={styles.input}
              value={form.phone ?? ''}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            />

            <label style={styles.label}>Visa Status</label>
            <select
              style={styles.input}
              value={form.visaStatus ?? ''}
              onChange={e => setForm(f => ({ ...f, visaStatus: e.target.value }))}
            >
              <option value="">Prefer not to say</option>
              <option value="Student">Student</option>
              <option value="PR">Permanent Resident</option>
              <option value="Citizen">Citizen</option>
              <option value="WorkingHoliday">Working Holiday</option>
            </select>

            <button style={styles.saveBtn} onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {stats && (
        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>Profile Stats</h3>
          <div style={styles.statsGrid}>
            <Stat label="Books Listed"    value={stats.booksListed} />
            <Stat label="Books Swapped"   value={stats.booksSwapped} />
            <Stat label="Books Lent"      value={stats.booksLent} />
            <Stat label="Books Donated"   value={stats.booksDonated} />
            <Stat label="Returns on Time" value={stats.returnsOnTime} />
            <Stat label="Defaults"        value={stats.defaults} colour={stats.defaults > 0 ? '#ef4444' : undefined} />
          </div>
        </div>
      )}

      <div style={styles.card}>
        <h3 style={styles.sectionTitle}>How Reputation Works</h3>
        <div style={styles.repList}>
          {[
            { action: 'Listed a book',         pts: '+5' },
            { action: 'Completed a swap',       pts: '+10' },
            { action: 'Returned on time',       pts: '+15' },
            { action: 'Passed it on',           pts: '+10' },
            { action: 'Received 5‑star review', pts: '+5' },
            { action: 'Defaulted on return',    pts: '−20' },
          ].map(({ action, pts }) => (
            <div key={action} style={styles.repRow}>
              <span>{action}</span>
              <span style={{ color: pts.startsWith('−') ? '#ef4444' : '#10b981', fontWeight: 600 }}>
                {pts}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, colour }: { label: string; value: number; colour?: string }) {
  return (
    <div style={styles.statBox}>
      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: colour ?? '#1a1a1a' }}>{value}</div>
      <div style={styles.muted}>{label}</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page:         { maxWidth: 640, margin: '2rem auto', padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  card:         { background: '#fff', borderRadius: 12, padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  headerRow:    { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  name:         { margin: 0, fontSize: '1.25rem', fontWeight: 700 },
  muted:        { color: '#6b7280', fontSize: '0.875rem', margin: '0.25rem 0 0' },
  editBtn:      { background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 500 },
  editForm:     { marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  label:        { fontSize: '0.8rem', fontWeight: 600, color: '#374151' },
  input:        { border: '1px solid #e5e7eb', borderRadius: 8, padding: '0.5rem 0.75rem', fontSize: '0.9rem', outline: 'none' },
  saveBtn:      { marginTop: '0.5rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, padding: '0.6rem 1.25rem', cursor: 'pointer', fontWeight: 600, alignSelf: 'flex-start' },
  sectionTitle: { margin: '0 0 1rem', fontSize: '1rem', fontWeight: 600 },
  statsGrid:    { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' },
  statBox:      { textAlign: 'center', padding: '0.75rem', background: '#f9fafb', borderRadius: 8 },
  repList:      { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  repRow:       { display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', padding: '0.4rem 0', borderBottom: '1px solid #f3f4f6' },
};
