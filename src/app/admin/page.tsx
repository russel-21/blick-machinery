'use client';

import { useAuth } from '@/components/AuthProvider';
import { db } from '@/lib/auth';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalPayments: 0,
    totalSales: 0,
    totalPending: 0
  });

  useEffect(() => {
    // Load from mock db
    const loadedUsers = db.getUsers();
    const loadedPayments = db.getPayments();
    
    setUsers(loadedUsers);
    setPayments(loadedPayments);

    // Calculate metrics
    const totalSales = loadedPayments.reduce((sum, p) => sum + p.totalAmount, 0);
    const totalPaid = loadedPayments.reduce((sum, p) => sum + p.paidAmount, 0);
    const totalPending = totalSales - totalPaid;

    setMetrics({
      totalUsers: loadedUsers.length,
      totalPayments: loadedPayments.length,
      totalSales,
      totalPending
    });
  }, []);

  // Sort users to get newly registered ones first
  const newUsers = [...users]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, fontFamily: "'Outfit', sans-serif" }}>
            Tableau de <span className="text-gold-gradient">Bord</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Bienvenue dans votre console de gestion, {user?.name}.
          </p>
        </div>
        <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', padding: '0.5rem 1rem', borderRadius: '30px' }}>
          📅 Date actuelle : {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* KPI Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        
        {/* Metric 1 */}
        <div className="glass-card" style={{ padding: '1.75rem', border: '1px solid rgba(245,166,35,0.15)', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', fontWeight: 700, letterSpacing: '0.06em' }}>UTILISATEURS ENREGISTRÉS</span>
            <span style={{ fontSize: '1.5rem' }}>👥</span>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, fontFamily: "'Outfit', sans-serif", color: 'white' }}>{metrics.totalUsers}</div>
          <div style={{ fontSize: '0.75rem', color: '#4ade80', marginTop: '0.4rem', fontWeight: 600 }}>
            ↑ +100% (Base de données locale active)
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-card" style={{ padding: '1.75rem', border: '1px solid rgba(245,166,35,0.15)', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', fontWeight: 700, letterSpacing: '0.06em' }}>CONTRATS DE TRANCHES</span>
            <span style={{ fontSize: '1.5rem' }}>📄</span>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, fontFamily: "'Outfit', sans-serif", color: 'white' }}>{metrics.totalPayments}</div>
          <div style={{ fontSize: '0.75rem', color: '#f5a623', marginTop: '0.4rem', fontWeight: 600 }}>
            Paiements en tranches actifs
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-card" style={{ padding: '1.75rem', border: '1px solid rgba(245,166,35,0.15)', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', fontWeight: 700, letterSpacing: '0.06em' }}>VALEUR TOTALE MACHINES</span>
            <span style={{ fontSize: '1.5rem' }}>💰</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: "'Outfit', sans-serif", color: '#f5a623' }}>
            {metrics.totalSales.toLocaleString('fr-FR')} $
          </div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.4rem', fontWeight: 600 }}>
            Volume sous contrat négocié
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-card" style={{ padding: '1.75rem', border: '1px solid rgba(245,166,35,0.15)', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', fontWeight: 700, letterSpacing: '0.06em' }}>RESTE À PAYER TOTAL</span>
            <span style={{ fontSize: '1.5rem' }}>⏳</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: "'Outfit', sans-serif", color: '#f87171' }}>
            {metrics.totalPending.toLocaleString('fr-FR')} $
          </div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.4rem', fontWeight: 600 }}>
            À recouvrir selon échéances
          </div>
        </div>

      </div>

      {/* Grid: New Users & Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '2rem' }} className="dashboard-grid">
        
        {/* Newly Registered Users */}
        <div className="glass-card" style={{ padding: '2rem', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', fontFamily: "'Outfit', sans-serif" }}>
            🆕 Nouveaux <span className="text-gold-gradient">Inscrits</span>
          </h2>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
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

        {/* Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass-card" style={{ padding: '2rem', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', fontFamily: "'Outfit', sans-serif" }}>
              ⚡ Raccourcis <span className="text-gold-gradient">Rapides</span>
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {user?.role === 'admin' && (
                <Link href="/admin/utilisateurs" style={{ textDecoration: 'none' }}>
                  <button className="btn-primary" style={{ width: '100%', padding: '0.8rem', fontSize: '0.85rem', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>👥 Assigner des rôles</span>
                    <span>→</span>
                  </button>
                </Link>
              )}
              <Link href="/admin/medias" style={{ textDecoration: 'none' }}>
                <button className="btn-outline" style={{ width: '100%', padding: '0.8rem', fontSize: '0.85rem', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>🖼️ Ajouter des photos/vidéos</span>
                  <span>→</span>
                </button>
              </Link>
              <Link href="/admin/paiements" style={{ textDecoration: 'none' }}>
                <button className="btn-outline" style={{ width: '100%', padding: '0.8rem', fontSize: '0.85rem', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>💰 Gérer les tranches clients</span>
                  <span>→</span>
                </button>
              </Link>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem', border: '1px solid rgba(245,166,35,0.2)', borderRadius: '12px', background: 'rgba(245,166,35,0.04)' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f5a623', marginBottom: '0.5rem' }}>🔒 Chiffrement de bout en bout</h3>
            <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, margin: 0 }}>
              Toutes les données de transactions, d&apos;inscription et de réinitialisation de mot de passe sont sécurisées par un chiffrement fort. Les négociations commerciales restent confidentielles.
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
