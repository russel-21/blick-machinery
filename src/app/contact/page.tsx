'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { productsDb } from '@/lib/products';
import { db } from '@/lib/auth';
import { isValidEmail, sanitizeInput } from '@/lib/security';

const COUNTRIES_DATA = [
  { name: 'Cameroun 🇨🇲', code: '+237', length: 9 },
  { name: 'Sénégal 🇸🇳', code: '+221', length: 9 },
  { name: 'Côte d\'Ivoire 🇨🇮', code: '+225', length: 10 },
  { name: 'Gabon 🇬🇦', code: '+241', length: 7 },
  { name: 'Congo 🇨🇬', code: '+242', length: 9 },
  { name: 'Tchad 🇹🇩', code: '+235', length: 8 },
  { name: 'RCA 🇨🇫', code: '+236', length: 8 },
  { name: 'Guinée Équatoriale 🇬🇶', code: '+240', length: 9 },
  { name: 'France 🇫🇷', code: '+33', length: 9 }
];

export default function ContactPage() {
  const { user, submitQuote } = useAuth();
  const [form, setForm] = useState({ nom: '', email: '', telephone: '', type: '' as 'machine' | 'materiel' | '', machine: '', message: '' });
  const [countryCode, setCountryCode] = useState('+237');
  const [productsList, setProductsList] = useState<any[]>([]);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState({
    emailAdmin: "contact@blickmachinery.cm",
    telAdmin: "+237 6 99 95 20 90",
    locationAdmin: "Stade Militi, Nditam, Douala, Cameroun",
    facebookUrl: "https://www.facebook.com/sistenar",
    whatsappNumber: "237699952090",
    tiktokUrl: "#",
    instagramUrl: "#",
    youtubeUrl: "#"
  });

  useEffect(() => {
    async function loadData() {
      const liveSettings = await db.getSettings();
      setSettings(liveSettings);
      
      const list = await productsDb.getItems();
      setProductsList(list);
    }
    loadData();
  }, []);

  // Autofill user details if logged in
  useEffect(() => {
    if (user) {
      let rawP = user.phone || '';
      let code = '+237';
      for (const c of COUNTRIES_DATA) {
        if (rawP.startsWith(c.code)) {
          code = c.code;
          rawP = rawP.slice(c.code.length).trim();
          break;
        }
      }
      setForm(prev => ({
        ...prev,
        nom: user.name || '',
        email: user.email || '',
        telephone: rawP
      }));
      setCountryCode(code);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSent(false);

    const trimmedNom = form.nom.trim();
    const trimmedPhone = form.telephone.trim();
    const trimmedEmail = form.email.trim();
    const trimmedMessage = form.message.trim();

    if (!trimmedNom || !trimmedPhone || !trimmedMessage || !form.type || !form.machine) {
      setError('Veuillez remplir tous les champs obligatoires (*).');
      return;
    }

    // Country code validation
    const rawDigits = trimmedPhone.replace(/\D/g, '');
    const selectedCountry = COUNTRIES_DATA.find(c => c.code === countryCode);

    if (!rawDigits) {
      setError('Veuillez renseigner un numéro de téléphone valide.');
      return;
    }

    if (selectedCountry && rawDigits.length !== selectedCountry.length) {
      setError(`Le numéro de téléphone pour le ${selectedCountry.name.split(' ')[0]} doit comporter exactement ${selectedCountry.length} chiffres.`);
      return;
    }

    if (trimmedEmail && !isValidEmail(trimmedEmail)) {
      setError('Format d\'adresse email invalide.');
      return;
    }

    const sanitizedNom = sanitizeInput(trimmedNom, 100);
    const sanitizedEmail = sanitizeInput(trimmedEmail, 100, true);
    const sanitizedMessage = sanitizeInput(trimmedMessage, 2000);
    const fullPhone = `${countryCode} ${rawDigits}`;

    const matchedProduct = productsList.find((p) => p.id === form.machine);
    const machineName = matchedProduct ? matchedProduct.name : 'Autre';

    try {
      await submitQuote({
        nom: sanitizedNom,
        email: sanitizedEmail,
        telephone: fullPhone,
        type: form.type as 'machine' | 'materiel',
        machine: form.machine,
        machineName,
        message: sanitizedMessage
      });
      setSent(true);
      setForm({ nom: '', email: '', telephone: '', type: '', machine: '', message: '' });
      setTimeout(() => setSent(false), 5000);
    } catch (err) {
      setError('Une erreur est survenue lors de l\'enregistrement de votre demande.');
    }
  };

  return (
    <>
      {/* Header */}
      <section style={{
        padding: '5rem 1.5rem 4rem',
        background: 'linear-gradient(135deg, #0d1b2a 0%, #0f2338 100%)',
        borderBottom: '1px solid rgba(245,166,35,0.15)',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div className="gold-divider" style={{ margin: '0 auto 1rem' }} />
          <h1 className="section-title" style={{ marginBottom: '1rem' }}>
            Contactez-<span className="text-gold-gradient">nous</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.1rem', lineHeight: 1.7 }}>
            Notre équipe vous répond dans les 24 heures. Obtenez votre devis gratuit aujourd&apos;hui.
          </p>
        </div>
      </section>

      <section style={{ padding: '5rem 1.5rem', background: '#0d1b2a' }}>
        <div className="contact-main-grid" style={{ maxWidth: '1100px', margin: '0 auto', alignItems: 'start' }}>

          {/* Contact info */}
          <div>
            <h2 style={{ color: 'white', fontWeight: 700, fontSize: '1.5rem', marginBottom: '2rem' }}>
              Nos <span className="text-gold-gradient">Coordonnées</span>
            </h2>

            {[
              { icon: '📞', label: 'Téléphone', value: settings.telAdmin, href: `tel:${settings.telAdmin}` },
              { icon: '✉️', label: 'Email', value: settings.emailAdmin, href: `mailto:${settings.emailAdmin}` },
              { icon: '📍', label: 'Adresse', value: settings.locationAdmin, href: null },
              { icon: '🕐', label: 'Horaires', value: 'Lun–Sam : 8h00 – 18h00', href: null },
            ].map((info, i) => (
              <div key={i} style={{
                display: 'flex', gap: '1rem', alignItems: 'flex-start',
                marginBottom: '1.75rem', padding: '1.25rem', borderRadius: '12px',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(245,166,35,0.1)',
              }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '10px', flexShrink: 0,
                  background: 'rgba(245,166,35,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.2rem',
                }}>
                  {info.icon}
                </div>
                <div>
                  <div style={{ color: '#f5a623', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '0.2rem' }}>{info.label.toUpperCase()}</div>
                  {info.href ? (
                    <a href={info.href} style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.95rem', wordBreak: 'break-all' }}>{info.value}</a>
                  ) : (
                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem', margin: 0 }}>{info.value}</p>
                  )}
                </div>
              </div>
            ))}

            {/* Social */}
            <div style={{ padding: '1.5rem', borderRadius: '12px', background: 'rgba(245,166,35,0.05)', border: '1px solid rgba(245,166,35,0.15)', marginTop: '1rem' }}>
              <p style={{ color: '#f5a623', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.06em', marginBottom: '1rem' }}>SUIVEZ-NOUS</p>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                {[
                  { name: 'Facebook', href: settings.facebookUrl || 'https://www.facebook.com/sistenar', bg: '#1877f2' },
                  { name: 'WhatsApp', href: `https://wa.me/${(settings.whatsappNumber || '').replace(/\+/g, '')}`, bg: '#25d366' },
                  { name: 'Instagram', href: settings.instagramUrl || '#', bg: '#e1306c' },
                  { name: 'TikTok', href: settings.tiktokUrl || '#', bg: '#010101' },
                  { name: 'YouTube', href: settings.youtubeUrl || '#', bg: '#ff0000' },
                ].map((s) => (
                  <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" style={{
                    padding: '0.4rem 0.9rem', borderRadius: '20px', background: s.bg,
                    color: 'white', fontSize: '0.75rem', fontWeight: 700,
                    textDecoration: 'none', transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                    {s.name}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="glass-card" style={{ padding: '2.5rem', border: '1px solid rgba(245,166,35,0.2)' }}>
            <h2 style={{ color: 'white', fontWeight: 700, fontSize: '1.4rem', marginBottom: '0.5rem' }}>
              Demander un Devis Gratuit
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.875rem', marginBottom: '2rem' }}>
              Sélectionnez une machine ou du matériel réfractaire pour recevoir une offre de prix personnalisée.
            </p>

            {sent && (
              <div style={{
                background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
                borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem',
                color: '#4ade80', textAlign: 'center', fontWeight: 600,
              }}>
                ✅ Devis demandé avec succès ! Notre équipe technique vous répondra sous 24 heures.
              </div>
            )}

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem',
                color: '#f87171', textAlign: 'center', fontWeight: 600,
              }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="contact-form-grid" style={{ gap: '1rem' }}>
                <div>
                  <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>NOM COMPLET *</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Amadou Diallo"
                    required
                    maxLength={100}
                    value={form.nom}
                    onChange={e => setForm({...form, nom: e.target.value})}
                  />
                </div>
                <div>
                  <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>TÉLÉPHONE *</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <select
                      value={countryCode}
                      onChange={e => setCountryCode(e.target.value)}
                      style={{
                        padding: '0.8rem', borderRadius: '8px',
                        background: '#0d1b2a', border: '1px solid rgba(245,166,35,0.25)',
                        color: 'white', fontSize: '0.85rem', outline: 'none', cursor: 'pointer',
                        width: '120px'
                      }}
                    >
                      {COUNTRIES_DATA.map(c => (
                        <option key={c.code} value={c.code}>{c.code} ({c.name.split(' ')[0]})</option>
                      ))}
                    </select>
                    <input
                      className="form-input"
                      type="tel"
                      placeholder="ex: 699952090"
                      required
                      maxLength={20}
                      value={form.telephone}
                      onChange={e => setForm({...form, telephone: e.target.value.replace(/\D/g, '')})}
                      style={{ flex: 1 }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>EMAIL</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="votre@email.com"
                  maxLength={100}
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                />
              </div>

              <div className="contact-form-grid" style={{ gap: '1rem' }}>
                <div>
                  <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>VOUS RECHERCHEZ *</label>
                  <select
                    className="form-input"
                    value={form.type}
                    onChange={e => setForm({...form, type: e.target.value as any, machine: ''})}
                    required
                    style={{ background: '#0d1b2a', color: form.type ? 'white' : 'rgba(255,255,255,0.3)' }}
                  >
                    <option value="">Sélectionner Machine/Matériel...</option>
                    <option value="machine">🏭 MACHINE INDUSTRIELLE</option>
                    <option value="materiel">🧱 MATÉRIEL / RÉFRACTAIRES</option>
                  </select>
                </div>

                {form.type && (
                  <div>
                    <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>CHOISIR L&apos;ARTICLE *</label>
                    <select
                      className="form-input"
                      value={form.machine}
                      onChange={e => setForm({...form, machine: e.target.value})}
                      required
                      style={{ background: '#0d1b2a', color: form.machine ? 'white' : 'rgba(255,255,255,0.3)' }}
                    >
                      <option value="">-- Sélectionner --</option>
                      {productsList.filter(p => p.type === form.type).map(p => (
                        <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>MESSAGE ET BESOIN DÉTAILLÉ *</label>
                <textarea
                  className="form-input"
                  rows={5}
                  placeholder="Veuillez préciser la quantité de machines, la capacité horaire, le budget ou tout autre besoin technique particulier..."
                  required
                  maxLength={2000}
                  value={form.message}
                  onChange={e => setForm({...form, message: e.target.value})}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ fontSize: '1rem', padding: '1rem', width: '100%' }}>
                📋 Recevoir mon devis sous 24h
              </button>

              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', textAlign: 'center' }}>
                Ou contactez-nous directement via{' '}
                <a href={`https://wa.me/${settings.whatsappNumber}`} style={{ color: '#25d366', textDecoration: 'none' }}>WhatsApp</a>
              </p>
            </form>
          </div>
        </div>

        <style>{`
          .contact-main-grid {
            display: grid;
            grid-template-columns: 1fr 1.5fr;
            gap: 4rem;
          }
          .contact-form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
          }
          @media (max-width: 768px) {
            .contact-main-grid {
              grid-template-columns: 1fr !important;
              gap: 2.5rem !important;
            }
            .contact-form-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </section>

      {/* Map placeholder */}
      <section style={{ height: '300px', background: '#0a1628', display: 'flex', alignItems: 'center', justifyContent: 'center', borderTop: '1px solid rgba(245,166,35,0.1)' }}>
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📍</div>
          <p style={{ fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>{settings.locationAdmin}</p>
          <p style={{ fontSize: '0.8rem', marginTop: '0.4rem' }}>Coordonnées GPS disponibles sur demande</p>
        </div>
      </section>
    </>
  );
}
