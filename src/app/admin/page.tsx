'use client';

import { useAuth } from '@/components/AuthProvider';
import { db } from '@/lib/auth';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [cleaning, setCleaning] = useState(false);
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalPayments: 0,
    totalSales: 0,
    totalPending: 0,
    totalQuotes: 0,
    totalTickets: 0
  });

  const loadData = async () => {
    const loadedUsers = await db.getUsers();
    const loadedPayments = await db.getPayments();
    const loadedQuotes = await db.getQuotes();
    const loadedTickets = await db.getTickets();
    
    setUsers(loadedUsers);
    setPayments(loadedPayments);
    setQuotes(loadedQuotes);
    setTickets(loadedTickets);

    const totalSales = loadedPayments.reduce((sum, p) => sum + p.totalAmount, 0);
    const totalPaid = loadedPayments.reduce((sum, p) => sum + p.paidAmount, 0);
    const totalPending = totalSales - totalPaid;

    setMetrics({
      totalUsers: loadedUsers.length,
      totalPayments: loadedPayments.length,
      totalSales,
      totalPending,
      totalQuotes: loadedQuotes.length,
      totalTickets: loadedTickets.filter((t) => t.status !== 'resolved').length
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCleanFictional = async () => {
    if (confirm('Voulez-vous vraiment supprimer toutes les données fictives de démonstration ? (Cela conservera uniquement votre compte administrateur principal)')) {
      setCleaning(true);
      const res = await db.cleanFictionalData();
      if (res && res.success) {
        alert('Les données de démonstration fictives ont été supprimées avec succès !');
        window.location.reload();
      } else {
        alert('Erreur lors de la suppression des données.');
      }
      setCleaning(false);
    }
  };

  // Sort users to get newly registered ones first
  const newUsers = [...users]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Sort quotes to get new ones
  const pendingQuotes = quotes.filter((q) => q.status === 'pending').slice(0, 5);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, fontFamily: "'Outfit', sans-serif" }}>
            Tableau de <span className="text-gold-gradient">Bord</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Bienvenue dans votre console de gestion, {user?.name}.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            onClick={handleCleanFictional}
            disabled={cleaning}
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              padding: '0.5rem 1rem',
              borderRadius: '30px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)')}
          >
            🗑️ {cleaning ? 'Suppression...' : 'Supprimer valeurs fictives'}
          </button>
          <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', padding: '0.5rem 1rem', borderRadius: '30px' }}>
            📅 {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>

      {/* KPI Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        
        {/* Metric 1 */}
        <div className="glass-card" style={{ padding: '1.5rem', border: '1px solid rgba(245,166,35,0.15)', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', fontWeight: 700, letterSpacing: '0.06em' }}>UTILISATEURS</span>
            <span style={{ fontSize: '1.3rem' }}>👥</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: "'Outfit', sans-serif", color: 'white' }}>{metrics.totalUsers}</div>
          <div style={{ fontSize: '0.75rem', color: '#4ade80', marginTop: '0.4rem', fontWeight: 600 }}>
            Comptes enregistrés
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-card" style={{ padding: '1.5rem', border: '1px solid rgba(245,166,35,0.15)', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', fontWeight: 700, letterSpacing: '0.06em' }}>CONTRATS ACTIFS</span>
            <span style={{ fontSize: '1.3rem' }}>📄</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: "'Outfit', sans-serif", color: 'white' }}>{metrics.totalPayments}</div>
          <div style={{ fontSize: '0.75rem', color: '#f5a623', marginTop: '0.4rem', fontWeight: 600 }}>
            Paiements par tranches
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-card" style={{ padding: '1.5rem', border: '1px solid rgba(245,166,35,0.15)', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', fontWeight: 700, letterSpacing: '0.06em' }}>DEMANDES DE DEVIS</span>
            <span style={{ fontSize: '1.3rem' }}>📩</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: "'Outfit', sans-serif", color: '#f5a623' }}>{metrics.totalQuotes}</div>
          <div style={{ fontSize: '0.75rem', color: '#f5a623', marginTop: '0.4rem', fontWeight: 600 }}>
            Leads CRM en cours
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-card" style={{ padding: '1.5rem', border: '1px solid rgba(245,166,35,0.15)', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', fontWeight: 700, letterSpacing: '0.06em' }}>TICKETS SAV</span>
            <span style={{ fontSize: '1.3rem' }}>🛠️</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: "'Outfit', sans-serif", color: '#f87171' }}>{metrics.totalTickets}</div>
          <div style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '0.4rem', fontWeight: 600 }}>
            Support actif en cours
          </div>
        </div>

        {/* Metric 5 */}
        <div className="glass-card" style={{ padding: '1.5rem', border: '1px solid rgba(245,166,35,0.15)', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', fontWeight: 700, letterSpacing: '0.06em' }}>SOLDE À RECOUVRER</span>
            <span style={{ fontSize: '1.3rem' }}>💰</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: "'Outfit', sans-serif", color: '#f5a623' }}>
            {metrics.totalPending.toLocaleString('fr-FR')} $
          </div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.4rem', fontWeight: 600 }}>
            Sur un total de {metrics.totalSales.toLocaleString('fr-FR')} $
          </div>
        </div>

      </div>

      {/* Grid: New Users & CRM Devis */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }} className="dashboard-grid">
        
        {/* Left column: Quotes and Users */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Quotes requests */}
          <div className="glass-card" style={{ padding: '2rem', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', fontFamily: "'Outfit', sans-serif" }}>
              📩 Demandes de <span className="text-gold-gradient">Devis Récentes</span>
            </h2>
            {pendingQuotes.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                Aucune demande de devis en attente.
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '550px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <th style={{ padding: '0.75rem 0.5rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontWeight: 700 }}>NOM / ENTREPRISE</th>
                      <th style={{ padding: '0.75rem 0.5rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontWeight: 700 }}>PRODUIT DEMANDÉ</th>
                      <th style={{ padding: '0.75rem 0.5rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontWeight: 700 }}>DATE</th>
                      <th style={{ padding: '0.75rem 0.5rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontWeight: 700, textAlign: 'right' }}>ACCÈS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingQuotes.map((q) => (
                      <tr key={q.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '1rem 0.5rem' }}>
                          <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{q.nom}</div>
                          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{q.telephone}</div>
                        </td>
                        <td style={{ padding: '1rem 0.5rem' }}>
                          <span style={{ fontSize: '0.8rem', color: '#f5a623', fontWeight: 600 }}>
                            {q.machineName}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 0.5rem', fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }}>
                          {new Date(q.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        </td>
                        <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                          <Link href="/admin/paiements" style={{ textDecoration: 'none' }}>
                            <button style={{
                              background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.3)',
                              color: '#f5a623', padding: '0.3rem 0.7rem', borderRadius: '6px',
                              fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer'
                            }}>
                              Créer Contrat →
                            </button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Newly Registered Users */}
          <div className="glass-card" style={{ padding: '2rem', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', fontFamily: "'Outfit', sans-serif" }}>
              🆕 Nouveaux <span className="text-gold-gradient">Inscrits</span>
            </h2>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '550px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ padding: '0.75rem 0.5rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontWeight: 700 }}>UTILISATEUR</th>
                    <th style={{ padding: '0.75rem 0.5rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontWeight: 700 }}>RÔLE ACTUEL</th>
                    <th style={{ padding: '0.75rem 0.5rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontWeight: 700 }}>INSCRIPTION</th>
                    <th style={{ padding: '0.75rem 0.5rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontWeight: 700 }}>PAYS</th>
                  </tr>
                </thead>
                <tbody>
                  {newUsers.map((u, i) => (
                    <tr key={u.id} style={{ borderBottom: i < newUsers.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                      <td style={{ padding: '1rem 0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <div style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            background: 'rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.85rem', fontWeight: 700, color: '#f5a623'
                          }}>
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{u.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 0.5rem' }}>
                        <span style={{
                          fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '4px',
                          background: u.role === 'admin' ? 'rgba(239,68,68,0.1)' : u.role === 'negotiator' ? 'rgba(245,166,35,0.1)' : 'rgba(255,255,255,0.07)',
                          color: u.role === 'admin' ? '#f87171' : u.role === 'negotiator' ? '#f5a623' : 'rgba(255,255,255,0.6)'
                        }}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 0.5rem', fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }}>
                        {new Date(u.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </td>
                      <td style={{ padding: '1rem 0.5rem', fontSize: '0.82rem', color: 'rgba(255,255,255,0.8)' }}>
                        📍 {u.country || 'Non spécifié'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right column: Quick Actions & Security */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass-card" style={{ padding: '2rem', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', fontFamily: "'Outfit', sans-serif" }}>
              ⚡ Raccourcis <span className="text-gold-gradient">Rapides</span>
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {user?.role === 'admin' && (
                <Link href="/admin/utilisateurs" style={{ textDecoration: 'none' }}>
                  <button className="btn-primary" style={{ width: '100%', padding: '0.8rem', fontSize: '0.85rem', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>👥 Rôles & Suppression comptes</span>
                    <span>→</span>
                  </button>
                </Link>
              )}
              <Link href="/admin/medias" style={{ textDecoration: 'none' }}>
                <button className="btn-outline" style={{ width: '100%', padding: '0.8rem', fontSize: '0.85rem', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>🖼️ Gérer la galerie médias</span>
                  <span>→</span>
                </button>
              </Link>
              <Link href="/admin/paiements" style={{ textDecoration: 'none' }}>
                <button className="btn-outline" style={{ width: '100%', padding: '0.8rem', fontSize: '0.85rem', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>💰 Tranches manuelles & Facturation</span>
                  <span>→</span>
                </button>
              </Link>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem', border: '1px solid rgba(245,166,35,0.2)', borderRadius: '12px', background: 'rgba(245,166,35,0.04)' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f5a623', marginBottom: '0.5rem' }}>🔒 Base de Données Centralisée</h3>
            <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, margin: 0 }}>
              Les modifications de contrats, d&apos;utilisateurs, de likes de galerie ou de fiches techniques sont instantanément stockées sur le serveur et visibles par l&apos;ensemble des terminaux et clients connectés en temps réel.
            </p>
          </div>

        </div>

      </div>

      <style>{`
        @media (max-width: 900px) {
          .dashboard-grid {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
          }
        }
      `}</style>
    </div>
  );
}
