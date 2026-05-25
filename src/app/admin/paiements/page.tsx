'use client';

import { useState, useEffect } from 'react';
import { db, InstallmentPayment } from '@/lib/auth';
import { useAuth } from '@/components/AuthProvider';

export default function InstallmentManagement() {
  const { user } = useAuth();
  
  // State for agreements
  const [agreements, setAgreements] = useState<InstallmentPayment[]>([]);
  
  // Form state for creating a new agreement
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [machineName, setMachineName] = useState('');
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [numInstallments, setNumInstallments] = useState<number>(3);
  const [negotiatorName, setNegotiatorName] = useState('');

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    // Load data from mock DB
    setAgreements(db.getPayments());
    
    const allUsers = db.getUsers();
    // Filter to show clients/visitors as target contractees
    setClients(allUsers.filter((u) => u.role === 'client' || u.role === 'visitor'));
    
    if (user) {
      setNegotiatorName(user.name);
    }
  }, [user]);

  const handlePayInstallment = (agreementId: string, installmentId: string) => {
    const updated = agreements.map((agr) => {
      if (agr.id === agreementId) {
        let addedPaidAmount = 0;
        const updatedInsts = agr.installments.map((inst) => {
          if (inst.id === installmentId && inst.status === 'pending') {
            addedPaidAmount = inst.amount;
            return { ...inst, status: 'paid' as const, paidDate: new Date().toISOString().split('T')[0] };
          }
          return inst;
        });

        const newPaidAmount = agr.paidAmount + addedPaidAmount;
        const allPaid = updatedInsts.every((i) => i.status === 'paid');
        const newStatus = allPaid ? ('paid' as const) : ('partially_paid' as const);

        return {
          ...agr,
          paidAmount: newPaidAmount,
          status: newStatus,
          installments: updatedInsts
        };
      }
      return agr;
    });

    db.savePayments(updated);
    setAgreements(updated);
    setMessage({ type: 'success', text: 'La tranche a été enregistrée comme payée ! Historique mis à jour.' });
  };

  const handleCreateAgreement = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!selectedClient || !machineName || totalAmount <= 0 || numInstallments <= 0) {
      setMessage({ type: 'error', text: 'Veuillez remplir tous les champs correctement.' });
      return;
    }

    const clientUser = clients.find(c => c.id === selectedClient);
    if (!clientUser) return;

    // Split amount equally
    const sliceAmount = Math.round(totalAmount / numInstallments);
    const installments: any[] = [];
    
    for (let i = 1; i <= numInstallments; i++) {
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + i);
      installments.push({
        id: 'inst_' + Math.random().toString(36).substr(2, 9),
        amount: sliceAmount,
        dueDate: dueDate.toISOString().split('T')[0],
        status: 'pending'
      });
    }

    const newAgreement: InstallmentPayment = {
      id: 'pay_' + Math.random().toString(36).substr(2, 9),
      machineId: 'mac_' + Math.random().toString(36).substr(2, 5),
      machineName: `${machineName} (${clientUser.name})`,
      totalAmount,
      paidAmount: 0,
      negotiatorName: negotiatorName || user?.name || 'Négociateur Blick',
      status: 'pending',
      installments
    };

    const updated = [newAgreement, ...agreements];
    db.savePayments(updated);
    setAgreements(updated);

    // Reset form
    setMachineName('');
    setTotalAmount(0);
    setNumInstallments(3);
    setSelectedClient('');
    
    setMessage({ type: 'success', text: 'Nouvelle entente de paiement en tranches créée avec succès !' });
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, fontFamily: "'Outfit', sans-serif" }}>
          Paiements en <span className="text-gold-gradient">Tranches</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Gérez les ventes à crédit, planifiez les tranches avec les négociateurs officiels et validez l&apos;encaissement des règlements.
        </p>
      </div>

      {message && (
        <div style={{
          background: message.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
          border: '1px solid ' + (message.type === 'success' ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'),
          color: message.type === 'success' ? '#4ade80' : '#f87171',
          padding: '1rem', borderRadius: '8px', marginBottom: '2rem',
          fontSize: '0.9rem', fontWeight: 600, textAlign: 'center'
        }}>
          {message.text}
        </div>
      )}

      {/* Grid: Forms & Tables */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.9fr', gap: '2rem' }} className="payment-grid">
        
        {/* Create Agreement Form */}
        <div className="glass-card" style={{ padding: '2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', height: 'fit-content' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', fontFamily: "'Outfit', sans-serif" }}>
            🤝 Nouvelle <span className="text-gold-gradient">Entente</span>
          </h2>
          
          <form onSubmit={handleCreateAgreement} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            <div>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                SÉLECTIONNER LE CLIENT *
              </label>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                style={{
                  width: '100%', padding: '0.8rem', borderRadius: '8px',
                  background: '#0d1b2a', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white', outline: 'none', fontSize: '0.85rem', cursor: 'pointer'
                }}
              >
                <option value="">-- Choisir un client inscrit --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                MACHINE / MATÉRIEL *
              </label>
              <input
                type="text"
                placeholder="ex: Granuleuse Blick 1200"
                value={machineName}
                onChange={(e) => setMachineName(e.target.value)}
                required
                style={{
                  width: '100%', padding: '0.8rem', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white', outline: 'none', fontSize: '0.85rem'
                }}
              />
            </div>

            <div>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                PRIX NÉGOCIÉ TOTAL ($) *
              </label>
              <input
                type="number"
                value={totalAmount || ''}
                onChange={(e) => setTotalAmount(parseFloat(e.target.value))}
                placeholder="ex: 45000"
                required
                min="100"
                style={{
                  width: '100%', padding: '0.8rem', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white', outline: 'none', fontSize: '0.85rem'
                }}
              />
            </div>

            <div>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                NOMBRE DE TRANCHES (MENSUELLES) *
              </label>
              <select
                value={numInstallments}
                onChange={(e) => setNumInstallments(parseInt(e.target.value))}
                style={{
                  width: '100%', padding: '0.8rem', borderRadius: '8px',
                  background: '#0d1b2a', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white', outline: 'none', fontSize: '0.85rem', cursor: 'pointer'
                }}
              >
                <option value="2">2 mensualités</option>
                <option value="3">3 mensualités</option>
                <option value="4">4 mensualités</option>
                <option value="6">6 mensualités</option>
                <option value="12">12 mensualités</option>
              </select>
            </div>

            <div>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                NÉGOCIATEUR BLICK
              </label>
              <input
                type="text"
                value={negotiatorName}
                onChange={(e) => setNegotiatorName(e.target.value)}
                style={{
                  width: '100%', padding: '0.8rem', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white', outline: 'none', fontSize: '0.85rem'
                }}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ padding: '0.85rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem', marginTop: '0.5rem' }}>
              ✍️ Générer le Contrat de Crédit
            </button>
          </form>
        </div>

        {/* Agreements List and Schedules */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="glass-card" style={{ padding: '2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', fontFamily: "'Outfit', sans-serif" }}>
              📄 Contrats en <span className="text-gold-gradient">Cours</span>
            </h2>

            {agreements.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                Aucune entente de paiement en tranches enregistrée.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {agreements.map((agr) => {
                  const percentPaid = Math.round((agr.paidAmount / agr.totalAmount) * 100);
                  return (
                    <div key={agr.id} style={{
                      padding: '1.5rem', borderRadius: '10px', background: 'rgba(255,255,255,0.01)',
                      border: '1px solid rgba(255,255,255,0.06)'
                    }}>
                      
                      {/* Top Header of Contract */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{agr.machineName}</h3>
                          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                            Négociateur : <strong>{agr.negotiatorName}</strong> • Réf : {agr.id}
                          </span>
                        </div>
                        <span style={{
                          fontSize: '0.72rem', fontWeight: 700, padding: '0.25rem 0.6rem', borderRadius: '4px',
                          background: agr.status === 'paid' ? 'rgba(34,197,94,0.1)' : agr.status === 'partially_paid' ? 'rgba(245,166,35,0.1)' : 'rgba(255,255,255,0.05)',
                          color: agr.status === 'paid' ? '#4ade80' : agr.status === 'partially_paid' ? '#f5a623' : 'white'
                        }}>
                          {agr.status === 'paid' ? 'ENTIÈREMENT PAYÉ' : agr.status === 'partially_paid' ? 'PAIEMENT EN TRANCHES' : 'ATTENTE PREMIER DEPOSIT'}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div style={{ marginBottom: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                          <span style={{ color: 'rgba(255,255,255,0.6)' }}>Réglement : {agr.paidAmount.toLocaleString()} $ / {agr.totalAmount.toLocaleString()} $</span>
                          <span style={{ fontWeight: 700, color: '#f5a623' }}>{percentPaid}%</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '50px', overflow: 'hidden' }}>
                          <div style={{ width: `${percentPaid}%`, height: '100%', background: 'linear-gradient(90deg, #f5a623, #d4891a)', borderRadius: '50px', transition: 'width 0.4s ease' }} />
                        </div>
                      </div>

                      {/* Installment Slices / Tranches Detail */}
                      <div>
                        <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: '0.75rem', letterSpacing: '0.04em' }}>
                          📅 ÉCHÉANCIER DE PAIEMENT
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {agr.installments.map((inst, index) => (
                            <div key={inst.id} className="installment-row" style={{
                              padding: '0.6rem 0.85rem', borderRadius: '6px',
                              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.03)'
                            }}>
                              <div className="installment-info">
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)' }}>#{index + 1}</span>
                                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{inst.amount.toLocaleString()} $</span>
                                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Échéance : {inst.dueDate}</span>
                              </div>
                              
                              <div className="installment-actions">
                                {inst.status === 'paid' ? (
                                  <span style={{ fontSize: '0.75rem', color: '#4ade80', fontWeight: 700 }}>
                                    ✅ Payé le {inst.paidDate}
                                  </span>
                                ) : (
                                  <>
                                    <span style={{ fontSize: '0.75rem', color: '#f87171', fontWeight: 600 }}>⏳ En attente</span>
                                    <button
                                      onClick={() => handlePayInstallment(agr.id, inst.id)}
                                      style={{
                                        background: 'rgba(245,166,35,0.1)', color: '#f5a623',
                                        border: '1px solid rgba(245,166,35,0.25)',
                                        padding: '0.25rem 0.6rem', borderRadius: '4px',
                                        fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
                                        transition: 'all 0.2s'
                                      }}
                                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(245,166,35,0.25)')}
                                      onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(245,166,35,0.1)')}
                                    >
                                      Encaisser
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

      <style>{`
        .installment-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }
        .installment-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .installment-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-shrink: 0;
        }
        @media (max-width: 990px) {
          .payment-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
        }
        @media (max-width: 600px) {
          .installment-row {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 0.75rem !important;
            padding: 1rem !important;
          }
          .installment-info {
            gap: 0.5rem !important;
          }
          .installment-actions {
            justify-content: space-between !important;
            border-top: 1px solid rgba(255,255,255,0.05) !important;
            padding-top: 0.5rem !important;
          }
        }
      `}</style>
    </div>
  );
}
