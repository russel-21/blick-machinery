'use client';

import { useAuth } from '@/components/AuthProvider';
import { User, UserRole, db } from '@/lib/auth';
import { useState, useEffect } from 'react';

export default function UserRoleManagement() {
  const { user, updateUserRole, adminResetPassword, refreshUserList, deleteUser } = useAuth();
  const [userList, setUserList] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [resetMessage, setResetMessage] = useState<{ userName: string; email: string; pass: string } | null>(null);

  const loadUsers = async () => {
    const list = await refreshUserList();
    setUserList(list);
  };

  const handleCleanFictional = async () => {
    if (confirm("Voulez-vous vraiment réinitialiser les comptes et supprimer tous les utilisateurs fictifs ? (Votre compte Administrateur principal sera conservé)")) {
      const res = await db.cleanFictionalData();
      if (res && res.success) {
        alert("Comptes fictifs supprimés avec succès !");
        await loadUsers();
      } else {
        alert("Erreur lors de la réinitialisation.");
      }
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    await updateUserRole(userId, newRole);
    loadUsers();
  };

  const handleResetPassword = async (userId: string) => {
    const targetUser = userList.find((u) => u.id === userId);
    if (!targetUser) return;

    if (confirm(`Voulez-vous vraiment réinitialiser le mot de passe de ${targetUser.name} ?`)) {
      const generatedPass = await adminResetPassword(userId);
      setResetMessage({
        userName: targetUser.name,
        email: targetUser.email,
        pass: generatedPass
      });
      // Clear message after 15 seconds
      setTimeout(() => setResetMessage(null), 15000);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const targetUser = userList.find((u) => u.id === userId);
    if (!targetUser) return;

    if (confirm(`Voulez-vous vraiment SUPPRIMER DEFINITIVEMENT l'utilisateur ${targetUser.name} (${targetUser.email}) ?Cette action est irréversible.`)) {
      await deleteUser(userId);
      loadUsers();
    }
  };

  // Filter users based on search query
  const filteredUsers = userList.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, fontFamily: "'Outfit', sans-serif" }}>
          Utilisateurs & <span className="text-gold-gradient">Rôles</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Recherchez un utilisateur par nom, attribuez-lui des droits administratifs ou supprimez définitivement son compte.
        </p>
      </div>

      {/* Reset Password Success Notification */}
      {resetMessage && (
        <div style={{
          background: 'rgba(245,166,35,0.06)', border: '2px solid #f5a623',
          borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem',
          color: 'white', position: 'relative'
        }}>
          <button 
            onClick={() => setResetMessage(null)}
            style={{ position: 'absolute', top: '10px', right: '15px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '1.2rem', cursor: 'pointer' }}
          >
            ×
          </button>
          <h3 style={{ color: '#f5a623', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🔒 Mot de Passe Réinitialisé
          </h3>
          <p style={{ margin: '0 0 1rem 0', fontSize: '0.88rem', color: 'rgba(255,255,255,0.8)' }}>
            Le nouveau mot de passe pour <strong>{resetMessage.userName}</strong> ({resetMessage.email}) a été généré et chiffré en base de données.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              background: '#0d1b2a', border: '1px solid rgba(255,255,255,0.1)',
              padding: '0.75rem 1.5rem', borderRadius: '8px', fontSize: '1.1rem',
              fontWeight: 800, fontFamily: 'monospace', letterSpacing: '2px', color: '#f5a623'
            }}>
              {resetMessage.pass}
            </div>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(resetMessage.pass);
                alert('Mot de passe copié !');
              }}
              style={{
                background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)',
                padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600
              }}
            >
              📋 Copier
            </button>
          </div>
          <p style={{ margin: '0.75rem 0 0 0', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
            ⚠️ Note : Transmettez ce mot de passe de manière sécurisée à l&apos;utilisateur. Ce message disparaîtra automatiquement dans 15 secondes.
          </p>
        </div>
      )}

      {/* Controls: Search */}
      <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="text"
              placeholder="🔍 Rechercher un nom d'utilisateur ou un email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.85rem 1rem 0.85rem 2.5rem',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'white',
                outline: 'none',
                fontSize: '0.9rem'
              }}
            />
            <span style={{ position: 'absolute', left: '12px', top: '13px', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }}>🔎</span>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexShrink: 0 }}>
            <button
              onClick={handleCleanFictional}
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '0.65rem 1.25rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
              }}
            >
              🧹 Nettoyer comptes fictifs
            </button>
            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', flexShrink: 0 }}>
              {filteredUsers.length} utilisateur(s) trouvé(s)
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-card" style={{ padding: '2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '850px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <th style={{ padding: '1rem 0.75rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', fontWeight: 700 }}>UTILISATEUR</th>
              <th style={{ padding: '1rem 0.75rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', fontWeight: 700 }}>PAYS / ENTREPRISE</th>
              <th style={{ padding: '1rem 0.75rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', fontWeight: 700 }}>RÔLE ADMINISTRATIF</th>
              <th style={{ padding: '1rem 0.75rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', fontWeight: 700 }}>DATE D&apos;INSCRIPTION</th>
              <th style={{ padding: '1rem 0.75rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', fontWeight: 700, textAlign: 'right' }}>ACTIONS SECURITY</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u, i) => (
              <tr key={u.id} style={{ borderBottom: i < filteredUsers.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                
                {/* User info */}
                <td style={{ padding: '1.25rem 0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '38px', height: '38px', borderRadius: '50%',
                      background: 'rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1rem', fontWeight: 700, color: '#f5a623', border: '1px solid rgba(245,166,35,0.2)'
                    }}>
                      {u.role === 'admin' ? '👑' :
                       u.role === 'negotiator' ? '🤝' :
                       u.role === 'editor' ? '📝' :
                       u.role === 'client' ? '🏢' : '👤'}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'white' }}>
                        {u.name} {u.id === user?.id && <span style={{ color: '#f5a623', fontSize: '0.75rem', fontWeight: 500 }}>(Moi)</span>}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.1rem' }}>
                        {u.email} {u.isGoogleUser && <span style={{ color: '#4285f4', fontSize: '0.65rem' }}>• Google</span>}
                      </div>
                      {u.phone && <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.1rem' }}>📞 {u.phone}</div>}
                    </div>
                  </div>
                </td>

                {/* Country/Company */}
                <td style={{ padding: '1.25rem 0.75rem' }}>
                  <div style={{ fontSize: '0.85rem', color: 'white', fontWeight: 500 }}>📍 {u.country}</div>
                  {u.company && <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.2rem' }}>🏢 {u.company}</div>}
                </td>

                {/* Role select */}
                <td style={{ padding: '1.25rem 0.75rem' }}>
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                    disabled={u.id === user?.id} // Don't let active admin self-demote
                    style={{
                      padding: '0.4rem 0.8rem',
                      borderRadius: '6px',
                      background: '#0d1b2a',
                      border: '1px solid rgba(245,166,35,0.3)',
                      color: u.role === 'admin' ? '#f87171' : u.role === 'negotiator' ? '#f5a623' : 'white',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: u.id === user?.id ? 'not-allowed' : 'pointer',
                      outline: 'none'
                    }}
                  >
                    <option value="admin">Administrateur</option>
                    <option value="editor">Éditeur / Modérateur</option>
                    <option value="negotiator">Négociateur</option>
                    <option value="client">Client Principal</option>
                    <option value="visitor">Simple Visiteur</option>
                  </select>
                </td>

                {/* Created at */}
                <td style={{ padding: '1.25rem 0.75rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
                  📅 {new Date(u.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                </td>

                {/* Actions */}
                <td style={{ padding: '1.25rem 0.75rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => handleResetPassword(u.id)}
                      disabled={u.isGoogleUser} // Google OAuth users don't have passwords to reset
                      style={{
                        background: 'rgba(245,166,35,0.1)',
                        color: u.isGoogleUser ? 'rgba(255,255,255,0.2)' : '#f5a623',
                        border: '1px solid ' + (u.isGoogleUser ? 'rgba(255,255,255,0.05)' : 'rgba(245,166,35,0.25)'),
                        padding: '0.4rem 0.8rem',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: u.isGoogleUser ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      🔑 Reset Pwd
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      disabled={u.id === user?.id} // Cannot delete oneself
                      style={{
                        background: u.id === user?.id ? 'rgba(255,255,255,0.02)' : 'rgba(239,68,68,0.1)',
                        color: u.id === user?.id ? 'rgba(255,255,255,0.2)' : '#f87171',
                        border: '1px solid ' + (u.id === user?.id ? 'rgba(255,255,255,0.05)' : 'rgba(239,68,68,0.25)'),
                        padding: '0.4rem 0.8rem',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: u.id === user?.id ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      🗑️ Supprimer
                    </button>
                  </div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
