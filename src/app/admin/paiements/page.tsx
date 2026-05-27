'use client';

import { useState, useEffect } from 'react';
import { db, InstallmentPayment, User, Quote } from '@/lib/auth';
import { useAuth } from '@/components/AuthProvider';
import { productsDb } from '@/lib/products';

export default function InstallmentManagement() {
  const { user } = useAuth();
  
  // State for agreements
  const [agreements, setAgreements] = useState<InstallmentPayment[]>([]);
  const [clients, setClients] = useState<User[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [productsList, setProductsList] = useState<any[]>([]);
  const [clientSearch, setClientSearch] = useState('');

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(clientSearch.toLowerCase()) || 
    c.email.toLowerCase().includes(clientSearch.toLowerCase())
  );
  
  // Form states
  const [selectedClient, setSelectedClient] = useState('');
  const [productType, setProductType] = useState<'machine' | 'materiel' | ''>('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [depositAmount, setDepositAmount] = useState<number>(5000);
  const [negotiatorName, setNegotiatorName] = useState('');
  
  // Installment modes
  const [manualSlices, setManualSlices] = useState(false);
  const [numInstallments, setNumInstallments] = useState<number>(3);
  const [customInstallments, setCustomInstallments] = useState<{ id: string; amount: number; dueDate: string }[]>([
    { id: '1', amount: 0, dueDate: '' },
    { id: '2', amount: 0, dueDate: '' }
  ]);

  // Invoice modal
  const [activeInvoice, setActiveInvoice] = useState<InstallmentPayment | null>(null);
  const [invoiceClient, setInvoiceClient] = useState<User | null>(null);

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    const loadedPayments = await db.getPayments();
    setAgreements(loadedPayments);
    
    const allUsers = await db.getUsers();
    setClients(allUsers); // Show all registered users

    const loadedProducts = await productsDb.getItems();
    setProductsList(loadedProducts);

    const loadedQuotes = await db.getQuotes();
    setQuotes(loadedQuotes);

    if (user) {
      setNegotiatorName(user.name);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Handle auto-fill when clicking a pending quote request
  const handleApplyQuote = (quote: Quote) => {
    // Find client ID by matching email
    const matchedClient = clients.find(c => c.email.toLowerCase() === quote.email.toLowerCase());
    if (matchedClient) {
      setSelectedClient(matchedClient.id);
    } else {
      // If client not found, we can suggest registering them or just set select to empty
      setSelectedClient('');
    }
    
    setProductType(quote.type);
    setSelectedProductId(quote.machine);
    
    // Default estimated budget
    setTotalAmount(45000);
    setDepositAmount(5000);
    
    setMessage({ type: 'success', text: `Formulaire pré-rempli avec les choix de ${quote.nom} pour la machine : ${quote.machineName} !` });
  };

  // Trigger auto-fill when selecting a client who has a pending quote
  const handleClientChange = (clientId: string) => {
    setSelectedClient(clientId);
    const clientUser = clients.find(c => c.id === clientId);
    if (!clientUser) return;

    // Search for a pending quote for this client email
    const clientQuote = quotes.find(q => q.email.toLowerCase() === clientUser.email.toLowerCase() && q.status === 'pending');
    if (clientQuote) {
      setProductType(clientQuote.type);
      setSelectedProductId(clientQuote.machine);
      setTotalAmount(45000);
      setDepositAmount(5000);
      
      setMessage({ type: 'success', text: `Auto-remplissage : ${clientUser.name} a une demande de devis en cours pour : ${clientQuote.machineName}.` });
    }
  };

  // Add custom installment field
  const handleAddCustomInstallment = () => {
    setCustomInstallments([
      ...customInstallments,
      { id: Math.random().toString(36).substr(2, 9), amount: 0, dueDate: '' }
    ]);
  };

  // Remove custom installment field
  const handleRemoveCustomInstallment = (id: string) => {
    if (customInstallments.length > 1) {
      setCustomInstallments(customInstallments.filter(i => i.id !== id));
    }
  };

  // Update custom installment values
  const handleUpdateCustomInstallment = (id: string, field: 'amount' | 'dueDate', value: any) => {
    setCustomInstallments(customInstallments.map((inst) => {
      if (inst.id === id) {
        return {
          ...inst,
          [field]: field === 'amount' ? parseFloat(value) || 0 : value
        };
      }
      return inst;
    }));
  };

  // Pay standard installment
  const handlePayInstallment = async (agreementId: string, installmentId: string) => {
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
        const allPaid = updatedInsts.every((i) => i.status === 'paid') && (agr.depositStatus === 'paid');
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

    await db.savePayments(updated);
    setAgreements(updated);
    // Sync active invoice if open
    if (activeInvoice && activeInvoice.id === agreementId) {
      const match = updated.find(a => a.id === agreementId);
      if (match) setActiveInvoice(match);
    }
    setMessage({ type: 'success', text: 'Règlement encaissé avec succès ! Facture mise à jour.' });
  };

  // Pay downpayment/deposit
  const handlePayDeposit = async (agreementId: string) => {
    const updated = agreements.map((agr) => {
      if (agr.id === agreementId) {
        const deposit = agr.depositAmount || 0;
        const newPaidAmount = agr.paidAmount + deposit;
        const allPaid = agr.installments.every((i) => i.status === 'paid');
        const newStatus = allPaid ? ('paid' as const) : ('partially_paid' as const);

        return {
          ...agr,
          depositStatus: 'paid' as const,
          paidAmount: newPaidAmount,
          status: newStatus
        };
      }
      return agr;
    });

    await db.savePayments(updated);
    setAgreements(updated);
    if (activeInvoice && activeInvoice.id === agreementId) {
      const match = updated.find(a => a.id === agreementId);
      if (match) setActiveInvoice(match);
    }
    setMessage({ type: 'success', text: 'Acompte de confirmation encaissé avec succès ! Commande activée.' });
  };

  // Submit contract
  const handleCreateAgreement = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!selectedClient || !selectedProductId || totalAmount <= 0) {
      setMessage({ type: 'error', text: 'Veuillez remplir tous les champs obligatoires (*).' });
      return;
    }

    const clientUser = clients.find(c => c.id === selectedClient);
    if (!clientUser) return;

    const matchedProduct = productsList.find(p => p.id === selectedProductId);
    if (!matchedProduct) return;

    // Check sum of custom installments
    let finalInstallments: any[] = [];
    if (manualSlices) {
      const sumSlices = customInstallments.reduce((sum, inst) => sum + inst.amount, 0);
      const expectedSum = totalAmount - depositAmount;
      if (Math.abs(sumSlices - expectedSum) > 1) {
        setMessage({
          type: 'error',
          text: `Le total des mensualités (${sumSlices} $) ne correspond pas au reste à payer (${expectedSum} $) après déduction de l'acompte (${depositAmount} $).`
        });
        return;
      }
      finalInstallments = customInstallments.map((inst, index) => ({
        id: 'inst_' + Math.random().toString(36).substr(2, 9),
        amount: inst.amount,
        dueDate: inst.dueDate || new Date().toISOString().split('T')[0],
        status: 'pending'
      }));
    } else {
      // Auto divide remaining amount
      const remainingAmount = totalAmount - depositAmount;
      const sliceAmount = Math.round(remainingAmount / numInstallments);
      for (let i = 1; i <= numInstallments; i++) {
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + i);
        finalInstallments.push({
          id: 'inst_' + Math.random().toString(36).substr(2, 9),
          amount: i === numInstallments ? (remainingAmount - (sliceAmount * (numInstallments - 1))) : sliceAmount,
          dueDate: dueDate.toISOString().split('T')[0],
          status: 'pending'
        });
      }
    }

    const newAgreement: InstallmentPayment = {
      id: 'pay_' + Math.random().toString(36).substr(2, 9),
      machineId: selectedProductId,
      machineName: `${matchedProduct.name} (${clientUser.name})`,
      totalAmount,
      paidAmount: 0,
      negotiatorName: negotiatorName || user?.name || 'Négociateur Blick',
      status: 'pending',
      clientId: clientUser.id,
      depositAmount,
      depositStatus: 'pending',
      installments: finalInstallments
    };

    const updated = [newAgreement, ...agreements];
    await db.savePayments(updated);
    setAgreements(updated);

    // Update quote status to approved if client had a quote for this product
    const clientQuote = quotes.find(q => q.email.toLowerCase() === clientUser.email.toLowerCase() && q.machine === selectedProductId);
    if (clientQuote) {
      const updatedQuotes = quotes.map(q => q.id === clientQuote.id ? { ...q, status: 'approved' as const } : q);
      await db.saveQuotes(updatedQuotes);
      setQuotes(updatedQuotes);
    }

    // Reset Form
    setSelectedClient('');
    setProductType('');
    setSelectedProductId('');
    setTotalAmount(0);
    setDepositAmount(5000);
    setManualSlices(false);
    setCustomInstallments([
      { id: '1', amount: 0, dueDate: '' },
      { id: '2', amount: 0, dueDate: '' }
    ]);

    setMessage({ type: 'success', text: 'Nouveau contrat B2B enregistré avec échéancier de paiement !' });
  };

  // Open Invoice Modal
  const handleOpenInvoice = (agreement: InstallmentPayment) => {
    const matchingClient = clients.find(c => c.id === agreement.clientId);
    setInvoiceClient(matchingClient || null);
    setActiveInvoice(agreement);
  };

  // Filter pending quotes
  const pendingQuotes = quotes.filter(q => q.status === 'pending');

  return (
    <div>
      <div className="no-print">
        {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, fontFamily: "'Outfit', sans-serif" }}>
          Ventes & <span className="text-gold-gradient">Financement B2B</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Planifiez les tranches de paiement manuellement, définissez les acomptes de réservation et générez des factures professionnelles pour les clients de Blick Machinery.
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

      {/* Pending Quotes Alert Panel */}
      {pendingQuotes.length > 0 && (
        <div className="glass-card animate-pulse-gold" style={{ padding: '1.25rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid rgba(245,166,35,0.3)', background: 'rgba(245,166,35,0.02)' }}>
          <h4 style={{ color: '#f5a623', margin: '0 0 0.5rem 0', fontSize: '0.85rem', fontWeight: 700 }}>
            🔔 DEMANDES DE DEVIS CRM EN ATTENTE
          </h4>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {pendingQuotes.map((q) => (
              <button
                key={q.id}
                onClick={() => handleApplyQuote(q)}
                style={{
                  background: '#0d1b2a', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '30px', padding: '0.4rem 0.85rem', color: 'white',
                  fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#f5a623'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
              >
                👤 {q.nom} : {q.machineName} →
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1.75fr', gap: '2rem' }} className="payment-grid">
        
        {/* Left side: Create Contract Form */}
        <div className="glass-card" style={{ padding: '2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', height: 'fit-content' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', fontFamily: "'Outfit', sans-serif" }}>
            🤝 Nouveau <span className="text-gold-gradient">Plan Financier</span>
          </h2>
          
          <form onSubmit={handleCreateAgreement} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                SÉLECTIONNER LE CLIENT *
              </label>
              <input
                type="text"
                placeholder="🔍 Rechercher par nom ou email..."
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                style={{
                  width: '100%', padding: '0.65rem 0.8rem', borderRadius: '6px',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white', outline: 'none', fontSize: '0.8rem', marginBottom: '0.5rem'
                }}
              />
              <select
                value={selectedClient}
                onChange={(e) => handleClientChange(e.target.value)}
                required
                style={{
                  width: '100%', padding: '0.8rem', borderRadius: '8px',
                  background: '#0d1b2a', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white', outline: 'none', fontSize: '0.85rem', cursor: 'pointer'
                }}
              >
                <option value="">-- Choisir un client inscrit --</option>
                {filteredClients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.company || c.country})</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                  CATÉGORIE *
                </label>
                <select
                  value={productType}
                  onChange={(e) => {
                    setProductType(e.target.value as any);
                    setSelectedProductId('');
                  }}
                  required
                  style={{
                    width: '100%', padding: '0.8rem', borderRadius: '8px',
                    background: '#0d1b2a', border: '1px solid rgba(255,255,255,0.1)',
                    color: 'white', outline: 'none', fontSize: '0.85rem', cursor: 'pointer'
                  }}
                >
                  <option value="">-- Choisir --</option>
                  <option value="machine">🏭 Machine</option>
                  <option value="materiel">🧱 Matériel</option>
                </select>
              </div>

              <div>
                <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                  PRODUIT *
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  required
                  disabled={!productType}
                  style={{
                    width: '100%', padding: '0.8rem', borderRadius: '8px',
                    background: '#0d1b2a', border: '1px solid rgba(255,255,255,0.1)',
                    color: 'white', outline: 'none', fontSize: '0.85rem', cursor: 'pointer'
                  }}
                >
                  <option value="">-- Article --</option>
                  {productsList.filter(p => p.type === productType).map((p) => (
                    <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                  PRIX TOTAL NÉGOCIÉ ($) *
                </label>
                <input
                  type="number"
                  value={totalAmount || ''}
                  onChange={(e) => setTotalAmount(parseFloat(e.target.value) || 0)}
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
                  ACOMPTE CONFIRMATION ($) *
                </label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(parseFloat(e.target.value) || 0)}
                  placeholder="ex: 5000"
                  required
                  min="0"
                  style={{
                    width: '100%', padding: '0.8rem', borderRadius: '8px',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                    color: 'white', outline: 'none', fontSize: '0.85rem'
                  }}
                />
              </div>
            </div>

            {/* Slices Planning Mode Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.25rem 0' }}>
              <input
                type="checkbox"
                id="manual-toggle"
                checked={manualSlices}
                onChange={(e) => setManualSlices(e.target.checked)}
                style={{ accentColor: '#f5a623', cursor: 'pointer', width: '16px', height: '16px' }}
              />
              <label htmlFor="manual-toggle" style={{ color: 'white', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                ✍️ Saisie manuelle personnalisée des tranches
              </label>
            </div>

            {/* Slices Form fields */}
            {!manualSlices ? (
              <div>
                <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                  NOMBRE DE MENSUALITÉS AUTOMATIQUES
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
                  <option value="2">2 mensualités égales</option>
                  <option value="3">3 mensualités égales</option>
                  <option value="4">4 mensualités égales</option>
                  <option value="6">6 mensualités égales</option>
                  <option value="12">12 mensualités égales</option>
                </select>
              </div>
            ) : (
              <div style={{ border: '1px solid rgba(255,255,255,0.06)', padding: '1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.01)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f5a623' }}>📋 MENSUALITÉS PLANIFIÉES</span>
                  <button
                    type="button"
                    onClick={handleAddCustomInstallment}
                    style={{
                      background: 'rgba(245,166,35,0.1)', border: '1px solid #f5a623', color: '#f5a623',
                      borderRadius: '4px', padding: '0.2rem 0.5rem', fontSize: '0.75rem', cursor: 'pointer'
                    }}
                  >
                    + Ajouter
                  </button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {customInstallments.map((inst, idx) => (
                    <div key={inst.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', width: '25px' }}>#{idx+1}</span>
                      <input
                        type="number"
                        placeholder="Montant $"
                        value={inst.amount || ''}
                        onChange={(e) => handleUpdateCustomInstallment(inst.id, 'amount', e.target.value)}
                        style={{
                          flex: 1, padding: '0.5rem', borderRadius: '6px', background: '#0d1b2a',
                          border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.8rem'
                        }}
                      />
                      <input
                        type="date"
                        value={inst.dueDate}
                        onChange={(e) => handleUpdateCustomInstallment(inst.id, 'dueDate', e.target.value)}
                        style={{
                          flex: 1.2, padding: '0.5rem', borderRadius: '6px', background: '#0d1b2a',
                          border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.8rem'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomInstallment(inst.id)}
                        disabled={customInstallments.length <= 1}
                        style={{
                          background: 'none', border: 'none', color: '#ef4444',
                          cursor: 'pointer', fontSize: '1.1rem', opacity: customInstallments.length <= 1 ? 0.3 : 1
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textAlign: 'right' }}>
                  Reste à répartir : <strong>{(totalAmount - depositAmount - customInstallments.reduce((s,i)=>s+i.amount, 0))} $</strong>
                </div>
              </div>
            )}

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
              ✍️ Créer le Contrat & Activer la Commande
            </button>
          </form>
        </div>

        {/* Right side: List of Contracts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="glass-card" style={{ padding: '2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', fontFamily: "'Outfit', sans-serif" }}>
              📄 Contrats de Vente <span className="text-gold-gradient">Actifs</span>
            </h2>

            {agreements.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                Aucun contrat de paiement enregistré.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {agreements.map((agr) => {
                  const percentPaid = agr.totalAmount > 0 ? Math.round((agr.paidAmount / agr.totalAmount) * 100) : 0;
                  return (
                    <div key={agr.id} style={{
                      padding: '1.5rem', borderRadius: '10px', background: 'rgba(255,255,255,0.01)',
                      border: '1px solid rgba(255,255,255,0.06)'
                    }}>
                      {/* Contract Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{agr.machineName}</h3>
                          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                            Réf : {agr.id} • Négociateur : <strong>{agr.negotiatorName}</strong>
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <button
                            onClick={() => handleOpenInvoice(agr)}
                            style={{
                              background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.3)',
                              color: '#f5a623', padding: '0.25rem 0.5rem', borderRadius: '4px',
                              fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer'
                            }}
                          >
                            🧾 Facture PDF
                          </button>
                          <span style={{
                            fontSize: '0.72rem', fontWeight: 700, padding: '0.25rem 0.6rem', borderRadius: '4px',
                            background: agr.status === 'paid' ? 'rgba(34,197,94,0.1)' : agr.status === 'partially_paid' ? 'rgba(245,166,35,0.1)' : 'rgba(255,255,255,0.05)',
                            color: agr.status === 'paid' ? '#4ade80' : agr.status === 'partially_paid' ? '#f5a623' : 'white'
                          }}>
                            {agr.status === 'paid' ? 'SOLDE ENTIÈREMENT RÉGLÉ' : agr.status === 'partially_paid' ? 'CRÉDIT ACTIF' : 'ATTENTE ACOMPTE'}
                          </span>
                        </div>
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

                      {/* Deposit Payment */}
                      {agr.depositAmount && (
                        <div style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '0.5rem 0.85rem', borderRadius: '6px', marginBottom: '0.75rem',
                          background: agr.depositStatus === 'paid' ? 'rgba(34,197,94,0.05)' : 'rgba(245,166,35,0.05)',
                          border: '1px dashed ' + (agr.depositStatus === 'paid' ? 'rgba(34,197,94,0.15)' : 'rgba(245,166,35,0.25)')
                        }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: agr.depositStatus === 'paid' ? '#4ade80' : '#f5a623' }}>
                            🔑 ACOMPTE DE RESERVATION (CONTRAT DE CRÉDIT)
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{agr.depositAmount.toLocaleString()} $</span>
                            {agr.depositStatus === 'paid' ? (
                              <span style={{ fontSize: '0.72rem', color: '#4ade80', fontWeight: 700 }}>✅ Reçu</span>
                            ) : (
                              <button
                                onClick={() => handlePayDeposit(agr.id)}
                                style={{
                                  background: 'rgba(245,166,35,0.2)', color: 'white', border: '1px solid #f5a623',
                                  padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer'
                                }}
                              >
                                Encaisser Acompte
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Installment Slices */}
                      <div>
                        <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
                          📅 ÉCHÉANCES DE PAIEMENT MENSUELLES
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
                                      disabled={agr.depositStatus !== 'paid'} // Downpayment must be paid first
                                      style={{
                                        background: agr.depositStatus === 'paid' ? 'rgba(245,166,35,0.1)' : 'rgba(255,255,255,0.02)',
                                        color: agr.depositStatus === 'paid' ? '#f5a623' : 'rgba(255,255,255,0.2)',
                                        border: '1px solid ' + (agr.depositStatus === 'paid' ? 'rgba(245,166,35,0.25)' : 'rgba(255,255,255,0.05)'),
                                        padding: '0.25rem 0.6rem', borderRadius: '4px',
                                        fontSize: '0.72rem', fontWeight: 700, cursor: agr.depositStatus === 'paid' ? 'pointer' : 'not-allowed',
                                        transition: 'all 0.2s'
                                      }}
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
      </div>

      {/* ================= INVOICE GENERATION MODAL ================= */}
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
                  {invoiceClient ? (
                    <p style={{ fontSize: '0.85rem', color: 'white', lineHeight: 1.4, margin: 0 }}>
                      <strong>{invoiceClient.name}</strong><br />
                      {invoiceClient.company && <>Entreprise : {invoiceClient.company}<br /></>}
                      Pays : {invoiceClient.country}<br />
                      Tél : {invoiceClient.phone || 'Non renseigné'}<br />
                      Email : {invoiceClient.email}
                    </p>
                  ) : (
                    <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', fontStyle: 'italic', margin: 0 }}>
                      Client non référencé dans la base ou supprimé.
                    </p>
                  )}
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
                Facture commerciale établie par Blick Machinery Cameroon SARL. L&apos;acompte de confirmation de réservation valide la mise en préparation de la commande en usine en Chine. En cas de retard de paiement supérieur à 30 jours sur une tranche, des pénalités de 1.5% mensuel s&apos;appliquent.
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Global CSS for Print Layout and Responsiveness */}
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
