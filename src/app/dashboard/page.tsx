'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { db, InstallmentPayment, Quote, SAVTicket } from '@/lib/auth';
import { sanitizeInput } from '@/lib/security';

export default function ClientDashboard() {
  const { user, submitTicket } = useAuth();
  const router = useRouter();

  // Tab State
  const [activeTab, setActiveTab] = useState<'overview' | 'quotes' | 'orders' | 'sav' | 'downloads' | 'invoices'>('overview');
  
  // Data State
  const [clientPayments, setClientPayments] = useState<InstallmentPayment[]>([]);
  const [clientQuotes, setClientQuotes] = useState<Quote[]>([]);
  const [clientTickets, setClientTickets] = useState<SAVTicket[]>([]);

  // SAV Form State
  const [savForm, setSavForm] = useState({ machine: '', type: 'panne' as any, urgency: 'medium' as any, desc: '' });
  const [savSuccess, setSavSuccess] = useState(false);
  const [savError, setSavError] = useState('');

  // Invoice view modal
  const [activeInvoice, setActiveInvoice] = useState<InstallmentPayment | null>(null);

  const loadClientData = async () => {
    if (!user) return;
    
    // Load agreements matching client email or ID
    const payments = await db.getPayments();
    const matchedPayments = payments.filter((p) => p.clientId === user.id || p.machineName.includes(user.name));
    setClientPayments(matchedPayments);

    // Load quote requests matching client email
    const quotes = await db.getQuotes();
    const matchedQuotes = quotes.filter((q) => q.email.toLowerCase() === user.email.toLowerCase());
    setClientQuotes(matchedQuotes);

    // Load support tickets matching client ID
    const tickets = await db.getTickets();
    const matchedTickets = tickets.filter((t) => t.clientId === user.id);
    setClientTickets(matchedTickets);
  };

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    loadClientData();
  }, [user, router]);

  // Handle SAV submission
  const handleSavSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavError('');
    setSavSuccess(false);

    if (!user) return;
    if (!savForm.machine || !savForm.desc.trim()) {
      setSavError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    try {
      await submitTicket({
        clientId: user.id,
        clientName: user.name,
        machineName: savForm.machine,
        type: savForm.type,
        urgency: savForm.urgency,
        desc: sanitizeInput(savForm.desc, 1000)
      });
      setSavSuccess(true);
      setSavForm({ machine: '', type: 'panne', urgency: 'medium', desc: '' });
      loadClientData(); // reload list
      setTimeout(() => setSavSuccess(false), 5000);
    } catch {
      setSavError('Impossible d\'enregistrer le ticket support.');
    }
  };

  if (!user) {
    return <div style={{ color: 'white', textAlign: 'center', padding: '5rem' }}>Redirection...</div>;
  }

  // Calculate stats
  const activeQuotesCount = clientQuotes.filter((q) => q.status === 'pending' || q.status === 'processing').length;
  const activeOrdersCount = clientPayments.filter((p) => p.status !== 'paid').length;
  const savTicketsCount = clientTickets.filter((t) => t.status !== 'resolved').length;

  return (
    <div style={{ background: '#0d1b2a', minHeight: '100vh', padding: '3rem 1.5rem' }}>
      <div className="no-print" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Profile Card Header */}
        <div className="glass-card" style={{ padding: '2.5rem', borderRadius: '16px', marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#f5a623', fontWeight: 700, letterSpacing: '0.08em' }}>B2B ESPACE PARTENAIRE</span>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0.2rem 0 0.5rem 0', fontFamily: "'Outfit', sans-serif" }}>
              Bonjour, <span className="text-gold-gradient">{user.name}</span> 👋
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', margin: 0 }}>
              🏢 {user.company || 'Compte Entreprise Privé'} • 📍 {user.country || 'Afrique'} • 📧 {user.email}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', textAlign: 'right' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>CONSEILLER ATTRIBUÉ</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f5a623', marginTop: '0.2rem' }}>Samuel Eto&apos;o</div>
              <div style={{ fontSize: '0.75rem', color: '#25d366', marginTop: '0.1rem', fontWeight: 600 }}>💬 WhatsApp Commercial</div>
            </div>
          </div>
        </div>

        {/* Tab Links */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '2.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {[
            { id: 'overview', label: '📊 Aperçu', show: true },
            { id: 'quotes', label: `📩 Mes Devis (${activeQuotesCount})`, show: true },
            { id: 'orders', label: `🚚 Suivi Livraisons (${activeOrdersCount})`, show: true },
            { id: 'sav', label: `🛠️ Support SAV (${savTicketsCount})`, show: true },
            { id: 'invoices', label: '🧾 Factures & Paiements', show: true },
            { id: 'downloads', label: '📚 Bibliothèque Technique', show: true }
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: '0.8rem 1.5rem', borderRadius: '8px 8px 0 0', border: 'none',
                  background: isSelected ? 'rgba(245,166,35,0.1)' : 'transparent',
                  color: isSelected ? '#f5a623' : 'rgba(255,255,255,0.6)',
                  fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                  borderBottom: isSelected ? '3px solid #f5a623' : '3px solid transparent',
                  transition: 'all 0.2s', flexShrink: 0
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ================= TAB 1: OVERVIEW ================= */}
        {activeTab === 'overview' && (
          <div>
            {/* KPI metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
              <div className="glass-card" style={{ padding: '1.5rem', border: '1px solid rgba(245,166,35,0.1)' }}>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>DEMANDES DE DEVIS</span>
                <div style={{ fontSize: '2rem', fontWeight: 900, marginTop: '0.5rem', color: 'white' }}>{clientQuotes.length}</div>
                <div style={{ fontSize: '0.75rem', color: '#f5a623', marginTop: '0.2rem' }}>{activeQuotesCount} en cours d&apos;analyse</div>
              </div>
              <div className="glass-card" style={{ padding: '1.5rem', border: '1px solid rgba(245,166,35,0.1)' }}>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>COMMANDES EN COURS</span>
                <div style={{ fontSize: '2rem', fontWeight: 900, marginTop: '0.5rem', color: 'white' }}>{clientPayments.length}</div>
                <div style={{ fontSize: '0.75rem', color: '#4ade80', marginTop: '0.2rem' }}>{activeOrdersCount} livraisons actives</div>
              </div>
              <div className="glass-card" style={{ padding: '1.5rem', border: '1px solid rgba(245,166,35,0.1)' }}>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>TICKETS SAV EN COURS</span>
                <div style={{ fontSize: '2rem', fontWeight: 900, marginTop: '0.5rem', color: 'white' }}>{savTicketsCount}</div>
                <div style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '0.2rem' }}>Assistance technique active</div>
              </div>
            </div>

            {/* Quick Summary Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }} className="overview-layout">
              {/* Notifications box */}
              <div className="glass-card" style={{ padding: '2rem', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.5rem', fontFamily: "'Outfit', sans-serif" }}>
                  🔔 Mises à jour & <span className="text-gold-gradient">Notifications</span>
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(245,166,35,0.03)', borderLeft: '3px solid #f5a623' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.25rem' }}>
                      <span>SUIVI LOGISTIQUE</span>
                      <span>25 Mai 2026</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600 }}>Votre commande concasseur mobile a été chargée sur le navire.</p>
                  </div>
                  <div style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', borderLeft: '3px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.25rem' }}>
                      <span>OFFRE DE DEVIS</span>
                      <span>20 Mai 2026</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem' }}>Devis pour la Grue Mobile de 50T validé et contrat de crédit prêt.</p>
                  </div>
                </div>
              </div>

              {/* Recommended products */}
              <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '12px', background: 'rgba(245,166,35,0.02)', border: '1px solid rgba(245,166,35,0.15)' }}>
                <h4 style={{ color: '#f5a623', fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem' }}>🌟 RECOMMANDATION MACHINE</h4>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏭</div>
                <h5 style={{ margin: '0 0 0.5rem 0', color: 'white', fontSize: '1rem', fontWeight: 700 }}>Granuleuse double vis Blick-Extruder</h5>
                <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, margin: '0 0 1.25rem 0' }}>
                  Augmentez votre productivité de granulation. Spécifications techniques avancées et pièces de rechange d&apos;origine incluses.
                </p>
                <Link href="/catalogue" style={{ textDecoration: 'none' }}>
                  <button className="btn-primary" style={{ width: '100%', padding: '0.6rem', fontSize: '0.8rem' }}>Consulter l&apos;offre</button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: QUOTES ================= */}
        {activeTab === 'quotes' && (
          <div className="glass-card" style={{ padding: '2rem', borderRadius: '12px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', fontFamily: "'Outfit', sans-serif" }}>
              📋 Historique de mes <span className="text-gold-gradient">Demandes de Devis</span>
            </h2>
            {clientQuotes.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', fontSize: '0.85rem' }}>Vous n&apos;avez encore soumis aucun devis.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                      <th style={{ padding: '0.75rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontWeight: 700 }}>RÉF DEVIS</th>
                      <th style={{ padding: '0.75rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontWeight: 700 }}>ÉQUIPEMENT SOUHAITÉ</th>
                      <th style={{ padding: '0.75rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontWeight: 700 }}>DATE DE DEMANDE</th>
                      <th style={{ padding: '0.75rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontWeight: 700 }}>STATUT ACTUEL</th>
                      <th style={{ padding: '0.75rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontWeight: 700 }}>MESSAGE CLIENT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientQuotes.map((q) => (
                      <tr key={q.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '1rem 0.75rem', fontSize: '0.85rem', fontWeight: 700 }}>#{q.id.toUpperCase()}</td>
                        <td style={{ padding: '1rem 0.75rem', fontSize: '0.85rem', fontWeight: 700, color: '#f5a623' }}>{q.machineName}</td>
                        <td style={{ padding: '1rem 0.75rem', fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }}>
                          {new Date(q.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </td>
                        <td style={{ padding: '1rem 0.75rem' }}>
                          <span style={{
                            fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '4px',
                            background: q.status === 'approved' ? 'rgba(34,197,94,0.1)' : q.status === 'pending' ? 'rgba(245,166,35,0.1)' : 'rgba(255,255,255,0.05)',
                            color: q.status === 'approved' ? '#4ade80' : q.status === 'pending' ? '#f5a623' : 'white'
                          }}>
                            {q.status === 'pending' ? '🟡 EN ANALYSE' : q.status === 'processing' ? '🔵 TRAITEMENT' : q.status === 'approved' ? '🟢 CONTRAT VALIDÉ' : '🔴 EXPIRÉ'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 0.75rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {q.message}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: LOGISTICS / ORDERS ================= */}
        {activeTab === 'orders' && (
          <div className="glass-card" style={{ padding: '2rem', borderRadius: '12px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', fontFamily: "'Outfit', sans-serif" }}>
              🚢 Suivi de livraison des <span className="text-gold-gradient">Commandes Industrielles</span>
            </h2>
            {clientPayments.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', fontSize: '0.85rem' }}>Aucun transport en cours pour le moment.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {clientPayments.map((p) => {
                  // Determine dummy logistics status based on paid amount or type
                  const step = p.status === 'paid' ? 4 : p.depositStatus === 'paid' ? 2 : 1;
                  return (
                    <div key={p.id} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                          <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0 }}>{p.machineName.split('(')[0]}</h3>
                          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Réf Contrat : {p.id}</span>
                        </div>
                        <span style={{ fontSize: '0.78rem', color: '#f5a623', fontWeight: 700 }}>
                          Transport Maritime Blick-Cargo China-Douala
                        </span>
                      </div>

                      {/* Timeline */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginTop: '1rem', flexWrap: 'wrap', gap: '1rem' }} className="timeline-container">
                        {[
                          { index: 1, label: 'Validation', icon: '✅' },
                          { index: 2, label: 'Préparation Usine (Chine)', icon: '🏭' },
                          { index: 3, label: 'Transit Maritime', icon: '🚢' },
                          { index: 4, label: 'Douala / Livraison finale', icon: '🚚' }
                        ].map((node) => {
                          const isActive = step >= node.index;
                          return (
                            <div key={node.label} style={{
                              display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: '100px',
                              opacity: isActive ? 1 : 0.3, position: 'relative'
                            }}>
                              <div style={{
                                width: '38px', height: '38px', borderRadius: '50%',
                                background: isActive ? 'linear-gradient(135deg, #f5a623, #d4891a)' : 'rgba(255,255,255,0.05)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
                                color: isActive ? '#0d1b2a' : 'white', fontWeight: 'bold',
                                boxShadow: isActive ? '0 0 15px rgba(245,166,35,0.3)' : 'none'
                              }}>
                                {node.icon}
                              </div>
                              <span style={{ fontSize: '0.78rem', fontWeight: isActive ? 700 : 500, color: 'white', marginTop: '0.5rem', textAlign: 'center' }}>
                                {node.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 4: SAV / ASSISTANCE ================= */}
        {activeTab === 'sav' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '2rem' }} className="sav-layout">
            
            {/* Create ticket form */}
            <div className="glass-card" style={{ padding: '2rem', borderRadius: '12px', height: 'fit-content' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', fontFamily: "'Outfit', sans-serif" }}>
                🛠️ Ouvrir un <span className="text-gold-gradient">Ticket SAV</span>
              </h3>
              
              {savSuccess && (
                <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid #4ade80', color: '#4ade80', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', textAlign: 'center', marginBottom: '1rem' }}>
                  ✅ Ticket ouvert avec succès ! Un ingénieur local vous contactera d&apos;ici peu.
                </div>
              )}

              {savError && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #f87171', color: '#f87171', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', textAlign: 'center', marginBottom: '1rem' }}>
                  ⚠️ {savError}
                </div>
              )}

              <form onSubmit={handleSavSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
                    SUR QUELLE MACHINE ? *
                  </label>
                  <input
                    type="text"
                    placeholder="ex: Granuleuse Blick 1200"
                    required
                    value={savForm.machine}
                    onChange={e => setSavForm({...savForm, machine: e.target.value})}
                    style={{
                      width: '100%', padding: '0.65rem', borderRadius: '6px',
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(245,166,35,0.2)',
                      color: 'white', fontSize: '0.8rem', outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div>
                    <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
                      TYPE *
                    </label>
                    <select
                      value={savForm.type}
                      onChange={e => setSavForm({...savForm, type: e.target.value as any})}
                      style={{
                        width: '100%', padding: '0.65rem', borderRadius: '6px',
                        background: '#0d1b2a', border: '1px solid rgba(245,166,35,0.2)',
                        color: 'white', fontSize: '0.8rem', outline: 'none', cursor: 'pointer'
                      }}
                    >
                      <option value="panne">🚨 Panne machine</option>
                      <option value="maintenance">🔧 Maintenance périodique</option>
                      <option value="installation">⚙️ Aide à l&apos;installation</option>
                      <option value="pieces">📦 Pièces de rechange</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
                      URGENCE *
                    </label>
                    <select
                      value={savForm.urgency}
                      onChange={e => setSavForm({...savForm, urgency: e.target.value as any})}
                      style={{
                        width: '100%', padding: '0.65rem', borderRadius: '6px',
                        background: '#0d1b2a', border: '1px solid rgba(245,166,35,0.2)',
                        color: 'white', fontSize: '0.8rem', outline: 'none', cursor: 'pointer'
                      }}
                    >
                      <option value="low">Faible</option>
                      <option value="medium">Moyenne</option>
                      <option value="high">Haute / Urgente</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
                    DESCRIPTION DU SOUCI TECHNIQUE *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={savForm.desc}
                    onChange={e => setSavForm({...savForm, desc: e.target.value})}
                    placeholder="Décrivez précisément les symptômes, bruits anormaux ou la pièce défectueuse recherchée..."
                    style={{
                      width: '100%', padding: '0.65rem', borderRadius: '6px',
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(245,166,35,0.2)',
                      color: 'white', fontSize: '0.8rem', outline: 'none', resize: 'vertical'
                    }}
                  />
                </div>

                <button type="submit" className="btn-primary" style={{ padding: '0.7rem', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700 }}>
                  ✉️ Envoyer la demande au SAV local
                </button>
              </form>
            </div>

            {/* Support history list */}
            <div className="glass-card" style={{ padding: '2rem', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', fontFamily: "'Outfit', sans-serif" }}>
                🛠️ Suivi de mes <span className="text-gold-gradient">Tickets Techniques</span>
              </h3>
              {clientTickets.length === 0 ? (
                <p style={{ color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', fontSize: '0.85rem' }}>Aucun ticket ouvert. Votre parc machine est opérationnel.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {clientTickets.map((t) => (
                    <div key={t.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'white' }}>{t.machineName}</span>
                        <span style={{
                          fontSize: '0.68rem', fontWeight: 700, padding: '0.15rem 0.4rem', borderRadius: '4px',
                          background: t.status === 'resolved' ? 'rgba(34,197,94,0.1)' : t.status === 'technician_assigned' ? 'rgba(245,166,35,0.1)' : 'rgba(255,255,255,0.05)',
                          color: t.status === 'resolved' ? '#4ade80' : t.status === 'technician_assigned' ? '#f5a623' : 'white'
                        }}>
                          {t.status === 'open' ? '🟡 OUVERT' : t.status === 'technician_assigned' ? '🔵 ASSIGNÉ' : '🟢 RÉSOLU'}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', margin: '0 0 0.5rem 0' }}>{t.desc}</p>
                      <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>
                        Urgence : <strong>{t.urgency.toUpperCase()}</strong> • Créé le {new Date(t.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ================= TAB 5: INVOICES & PAYMENTS ================= */}
        {activeTab === 'invoices' && (
          <div className="glass-card" style={{ padding: '2rem', borderRadius: '12px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', fontFamily: "'Outfit', sans-serif" }}>
              🧾 Mes Factures & <span className="text-gold-gradient">Échéances de Crédit</span>
            </h2>
            {clientPayments.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', fontSize: '0.85rem' }}>Aucune facture disponible.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {clientPayments.map((p) => (
                  <div key={p.id} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0 }}>{p.machineName.split('(')[0]}</h3>
                        <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>Ref : FAC-{p.id.toUpperCase()}</span>
                      </div>
                      <button
                        onClick={() => setActiveInvoice(p)}
                        style={{
                          background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.3)',
                          color: '#f5a623', padding: '0.4rem 0.9rem', borderRadius: '6px',
                          fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer'
                        }}
                      >
                        🧾 Consulter & Imprimer la Facture
                      </button>
                    </div>

                    {/* Installments Table */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {p.depositAmount && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', padding: '0.4rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <span>Acompte de confirmation :</span>
                          <span style={{ fontWeight: 600, color: p.depositStatus === 'paid' ? '#4ade80' : '#f5a623' }}>
                            {p.depositAmount.toLocaleString()} $ ({p.depositStatus === 'paid' ? 'Reçu' : 'Attente règlement'})
                          </span>
                        </div>
                      )}
                      {p.installments.map((inst, idx) => (
                        <div key={inst.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', padding: '0.4rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <span>Tranche #{idx+1} (Dû le : {inst.dueDate}) :</span>
                          <span style={{ fontWeight: 600, color: inst.status === 'paid' ? '#4ade80' : '#f87171' }}>
                            {inst.amount.toLocaleString()} $ ({inst.status === 'paid' ? 'Payé' : 'En attente'})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 6: DOWNLOADS ================= */}
        {activeTab === 'downloads' && (
          <div className="glass-card" style={{ padding: '2rem', borderRadius: '12px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', fontFamily: "'Outfit', sans-serif" }}>
              📚 Fiches Techniques & <span className="text-gold-gradient">Brochures Privées</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              En tant que partenaire B2B enregistré, vous disposez d&apos;un accès libre et privilégié aux documents de maintenance de nos usines partenaires en Chine.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {[
                { title: 'Brochure Générale Blick Refractory 2026', size: '12.4 Mo', format: 'PDF Document' },
                { title: 'Manuel d\'utilisation - Granuleuse Blick 1200', size: '8.2 Mo', format: 'PDF Document' },
                { title: 'Spécifications Techniques - Concasseur de Pierre 150T/h', size: '4.1 Mo', format: 'PDF Document' },
                { title: 'Fiche d\'installation électrique - Excavatrices Blick HD', size: '2.9 Mo', format: 'PDF Document' }
              ].map((doc, idx) => (
                <div key={idx} style={{
                  padding: '1.25rem', borderRadius: '8px', background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.85rem', color: 'white', fontWeight: 700 }}>{doc.title}</h4>
                    <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>{doc.format} • {doc.size}</span>
                  </div>
                  <button
                    onClick={() => alert(`Téléchargement de ${doc.title} démarré.`)}
                    style={{
                      background: 'rgba(245,166,35,0.1)', border: 'none', width: '36px', height: '36px',
                      borderRadius: '50%', color: '#f5a623', cursor: 'pointer', fontSize: '1rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    📥
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ================= CLIENT INVOICE MODAL ================= */}
      {activeInvoice && (
        <div className="print-modal-container" style={{
          position: 'fixed', inset: 0, zIndex: 99999,
          background: 'rgba(10,22,40,0.8)', backdropFilter: 'blur(10px)',
          display: 'flex', padding: '1.5rem', overflowY: 'auto'
        }}>
          <div className="glass-card print-modal-content" style={{
            width: '100%', maxWidth: '850px', background: '#0d1b2a', border: '1px solid rgba(245,166,35,0.25)',
            borderRadius: '20px', margin: 'auto', padding: '2.5rem', position: 'relative',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
          }}>
            
            {/* Modal Controls */}
            <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginBottom: '1.5rem' }}>
              <button
                onClick={() => window.print()}
                style={{
                  background: 'linear-gradient(135deg, #f5a623 0%, #d4891a 100%)', color: '#0d1b2a',
                  border: 'none', borderRadius: '6px', padding: '0.5rem 1.25rem', fontSize: '0.85rem',
                  fontWeight: 700, cursor: 'pointer'
                }}
              >
                🖨️ Imprimer la Facture
              </button>
              <button
                onClick={() => setActiveInvoice(null)}
                style={{
                  background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '6px', padding: '0.5rem 1.25rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer'
                }}
              >
                Fermer
              </button>
            </div>

            {/* Printable Area */}
            <div className="printable-invoice" style={{
              background: '#0d1b2a', color: 'white', padding: '2rem', borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
              
              {/* Invoice Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid rgba(245,166,35,0.3)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
                <div>
                  <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, fontFamily: "'Outfit', sans-serif" }}>
                    BLICK MACHINERY <span style={{ color: '#f5a623', fontSize: '0.75rem', display: 'block', fontWeight: 600 }}>CAMEROON SARL</span>
                  </h1>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.4 }}>
                    📍 Stade Militi, Nditam, Douala, Cameroun<br />
                    📞 +237 6 99 95 20 90<br />
                    ✉️ contact@blickmachinery.cm
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h2 style={{ color: '#f5a623', margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>FACTURE PROFORMA</h2>
                  <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.82rem', fontWeight: 600 }}>
                    N° : FAC-{activeInvoice.id.toUpperCase()}<br />
                    Date : {new Date().toLocaleDateString('fr-FR')}<br />
                    Statut : <span style={{ color: activeInvoice.status === 'paid' ? '#4ade80' : '#f5a623' }}>{activeInvoice.status === 'paid' ? 'PAYÉ' : 'CRÉDIT EN COURS'}</span>
                  </p>
                </div>
              </div>

              {/* Client & Negotiator Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                <div>
                  <h4 style={{ color: '#f5a623', fontSize: '0.8rem', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.3rem', marginBottom: '0.5rem' }}>
                    FACTURÉ À (CLIENT B2B)
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'white', lineHeight: 1.4, margin: 0 }}>
                    <strong>{user.name}</strong><br />
                    {user.company && <>Entreprise : {user.company}<br /></>}
                    Pays : {user.country}<br />
                    Tél : {user.phone || 'Non renseigné'}<br />
                    Email : {user.email}
                  </p>
                </div>
                <div>
                  <h4 style={{ color: '#f5a623', fontSize: '0.8rem', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.3rem', marginBottom: '0.5rem' }}>
                    NÉGOCIATION COMMERCIALE
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'white', lineHeight: 1.4, margin: 0 }}>
                    Garant d&apos;affaire : <strong>{activeInvoice.negotiatorName}</strong><br />
                    Réf Produit : {activeInvoice.machineId}<br />
                    Lieu d&apos;installation : Portée Afrique de l&apos;Ouest / Centrale
                  </p>
                </div>
              </div>

              {/* Product details table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginBottom: '2rem', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '2px solid rgba(245,166,35,0.2)' }}>
                    <th style={{ padding: '0.75rem', fontWeight: 700, color: '#f5a623' }}>DESCRIPTION DE L&apos;ÉQUIPEMENT</th>
                    <th style={{ padding: '0.75rem', fontWeight: 700, color: '#f5a623', textAlign: 'right' }}>MONTANT TOTAL NÉGOCIÉ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '1rem 0.75rem' }}>
                      <strong style={{ fontSize: '0.95rem' }}>{activeInvoice.machineName.split('(')[0].trim()}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.3rem' }}>
                        Importé de Blick Refractory Technology (Chine). Certification CE/ISO. Garantie SAV complète.
                      </div>
                    </td>
                    <td style={{ padding: '1rem 0.75rem', textAlign: 'right', fontSize: '1rem', fontWeight: 700 }}>
                      {activeInvoice.totalAmount.toLocaleString()} $
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Payments breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
                <div>
                  <h4 style={{ color: '#f5a623', fontSize: '0.8rem', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.3rem', marginBottom: '0.75rem' }}>
                    ÉCHÉANCIER DÉTAILLÉ DU CRÉDIT
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {activeInvoice.depositAmount && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', padding: '0.3rem 0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '4px' }}>
                        <span>Acompte de confirmation :</span>
                        <span style={{ fontWeight: 600, color: activeInvoice.depositStatus === 'paid' ? '#4ade80' : '#f5a623' }}>
                          {activeInvoice.depositAmount.toLocaleString()} $ ({activeInvoice.depositStatus === 'paid' ? 'Payé' : 'Attente'})
                        </span>
                      </div>
                    )}
                    {activeInvoice.installments.map((inst, index) => (
                      <div key={inst.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', padding: '0.3rem 0.5rem', background: 'rgba(255,255,255,0.01)', borderRadius: '4px' }}>
                        <span>Tranche #{index + 1} (Échéance : {inst.dueDate}) :</span>
                        <span style={{ fontWeight: 600, color: inst.status === 'paid' ? '#4ade80' : '#f87171' }}>
                          {inst.amount.toLocaleString()} $ ({inst.status === 'paid' ? 'Payé' : 'En attente'})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-end', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '220px', fontSize: '0.85rem' }}>
                    <span style={{ color: 'rgba(255,255,255,0.6)' }}>Total Payé :</span>
                    <span style={{ fontWeight: 700, color: '#4ade80' }}>{activeInvoice.paidAmount.toLocaleString()} $</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '220px', fontSize: '0.85rem' }}>
                    <span style={{ color: 'rgba(255,255,255,0.6)' }}>Solde restant :</span>
                    <span style={{ fontWeight: 700, color: '#f87171' }}>{(activeInvoice.totalAmount - activeInvoice.paidAmount).toLocaleString()} $</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '220px', fontSize: '1rem', borderTop: '2px solid #f5a623', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                    <span style={{ fontWeight: 800, color: '#f5a623' }}>Total Général :</span>
                    <span style={{ fontWeight: 800, color: '#f5a623' }}>{activeInvoice.totalAmount.toLocaleString()} $</span>
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div style={{ marginTop: '2.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center', lineHeight: 1.4 }}>
                Facture commerciale établie par Blick Machinery Cameroon SARL. L&apos;acompte de confirmation de réservation valide la mise en préparation de la commande en usine en Chine. En cas de retard de paiement supérieur à 30 jours sur une tranche, des pénalités de 1.5% mensuel s&apos;upliquent.
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Styles */}
      <style>{`
        @media (max-width: 800px) {
          .overview-layout, .sav-layout {
            grid-template-columns: 1fr !important;
          }
          .timeline-container {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
        }

        /* Printable stylesheet trick */
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          html, body, #__next, main {
            background: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
            height: auto !important;
          }
          .no-print, header, footer, nav, aside {
            display: none !important;
          }
          /* Style the modal container to take full print page */
          .print-modal-container {
            position: absolute !important;
            inset: 0 !important;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            display: block !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
          }
          .print-modal-content {
            background: white !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          /* Render ONLY the printable-invoice block */
          .printable-invoice {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: white !important;
            color: black !important;
            border: none !important;
            padding: 0 !important;
          }
          .printable-invoice * {
            color: black !important;
            border-color: #ccc !important;
            background: transparent !important;
          }
        }
      `}</style>
    </div>
  );
}
