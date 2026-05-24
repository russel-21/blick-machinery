'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/auth';

import { sanitizeUrl, sanitizeInput, isValidEmail, isValidPhone } from '@/lib/security';

export default function AdminSettings() {
  const [settings, setSettings] = useState<any>({
    aboutText: '',
    aboutMission: '',
    aboutVision: '',
    facebookUrl: '',
    whatsappNumber: '',
    tiktokUrl: '',
    instagramUrl: '',
    youtubeUrl: '',
    emailAdmin: '',
    telAdmin: '',
    locationAdmin: ''
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    // Load current settings
    setSettings(db.getSettings());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Validate email
    const trimmedEmail = settings.emailAdmin.trim();
    if (!isValidEmail(trimmedEmail)) {
      setMessage({ type: 'error', text: 'L\'adresse email d\'administration est invalide.' });
      return;
    }

    // Validate phone
    const trimmedPhone = settings.telAdmin.trim();
    if (!isValidPhone(trimmedPhone)) {
      setMessage({ type: 'error', text: 'Le numéro de téléphone est invalide. Utilisez uniquement des chiffres, espaces, parenthèses ou tirets.' });
      return;
    }

    try {
      const sanitizedSettings = {
        aboutText: sanitizeInput(settings.aboutText.trim(), 2000),
        aboutMission: sanitizeInput(settings.aboutMission.trim(), 1000),
        aboutVision: sanitizeInput(settings.aboutVision.trim(), 1000),
        facebookUrl: sanitizeUrl(settings.facebookUrl),
        whatsappNumber: sanitizeInput(settings.whatsappNumber.trim(), 30),
        tiktokUrl: sanitizeUrl(settings.tiktokUrl),
        instagramUrl: sanitizeUrl(settings.instagramUrl),
        youtubeUrl: sanitizeUrl(settings.youtubeUrl),
        emailAdmin: trimmedEmail.toLowerCase(),
        telAdmin: trimmedPhone,
        locationAdmin: sanitizeInput(settings.locationAdmin.trim(), 200)
      };

      db.saveSettings(sanitizedSettings);
      setSettings(sanitizedSettings); // update state with clean data
      setMessage({ type: 'success', text: 'Paramètres enregistrés avec succès ! La vitrine publique a été mise à jour.' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur lors de l\'enregistrement des paramètres.' });
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, fontFamily: "'Outfit', sans-serif" }}>
          Configuration <span className="text-gold-gradient">Vitrine</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Personnalisez la section À Propos, gérez les réseaux sociaux et changez les informations de contact visibles par les visiteurs.
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '2.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Section 1: Qui Sommes Nous */}
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f5a623', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.5rem' }}>
            📖 Section Qui Sommes-Nous & À Propos
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                TEXTE DE PRÉSENTATION PRINCIPAL
              </label>
              <textarea
                rows={4}
                maxLength={2000}
                value={settings.aboutText}
                onChange={(e) => setSettings({ ...settings, aboutText: e.target.value })}
                style={{
                  width: '100%', padding: '0.8rem', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white', outline: 'none', fontSize: '0.88rem', resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="form-grid">
              <div>
                <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                  NOTRE MISSION
                </label>
                <textarea
                  rows={3}
                  maxLength={1000}
                  value={settings.aboutMission}
                  onChange={(e) => setSettings({ ...settings, aboutMission: e.target.value })}
                  style={{
                    width: '100%', padding: '0.8rem', borderRadius: '8px',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                    color: 'white', outline: 'none', fontSize: '0.85rem', resize: 'vertical'
                  }}
                />
              </div>

              <div>
                <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                  NOTRE VISION
                </label>
                <textarea
                  rows={3}
                  maxLength={1000}
                  value={settings.aboutVision}
                  onChange={(e) => setSettings({ ...settings, aboutVision: e.target.value })}
                  style={{
                    width: '100%', padding: '0.8rem', borderRadius: '8px',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                    color: 'white', outline: 'none', fontSize: '0.85rem', resize: 'vertical'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Réseaux Sociaux */}
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f5a623', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.5rem' }}>
            🌐 Liens des Réseaux Sociaux (Doivent être fonctionnels)
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }} className="form-grid">
            <div>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                FACEBOOK URL
              </label>
              <input
                type="url"
                value={settings.facebookUrl}
                onChange={(e) => setSettings({ ...settings, facebookUrl: e.target.value })}
                style={{
                  width: '100%', padding: '0.8rem', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white', outline: 'none', fontSize: '0.85rem'
                }}
              />
            </div>

            <div>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                WHATSAPP (NUMÉRO AVEC INDICATIF PAYS)
              </label>
              <input
                type="text"
                placeholder="ex: +237699952090"
                value={settings.whatsappNumber}
                onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                style={{
                  width: '100%', padding: '0.8rem', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white', outline: 'none', fontSize: '0.85rem'
                }}
              />
            </div>

            <div>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                INSTAGRAM URL
              </label>
              <input
                type="text"
                value={settings.instagramUrl}
                onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                style={{
                  width: '100%', padding: '0.8rem', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white', outline: 'none', fontSize: '0.85rem'
                }}
              />
            </div>

            <div>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                TIKTOK URL
              </label>
              <input
                type="text"
                value={settings.tiktokUrl}
                onChange={(e) => setSettings({ ...settings, tiktokUrl: e.target.value })}
                style={{
                  width: '100%', padding: '0.8rem', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white', outline: 'none', fontSize: '0.85rem'
                }}
              />
            </div>

            <div>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                YOUTUBE URL
              </label>
              <input
                type="text"
                value={settings.youtubeUrl}
                onChange={(e) => setSettings({ ...settings, youtubeUrl: e.target.value })}
                style={{
                  width: '100%', padding: '0.8rem', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white', outline: 'none', fontSize: '0.85rem'
                }}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Contact Infos */}
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f5a623', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.5rem' }}>
            📞 Coordonnées Générales de Contact
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }} className="form-grid">
            <div>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                EMAIL D&apos;ADMINISTRATION (VISIBLE PUBLIC)
              </label>
              <input
                type="text"
                value={settings.emailAdmin}
                onChange={(e) => setSettings({ ...settings, emailAdmin: e.target.value })}
                style={{
                  width: '100%', padding: '0.8rem', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white', outline: 'none', fontSize: '0.85rem'
                }}
              />
            </div>

            <div>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                TÉLÉPHONE DE CONTACT (DOUALA)
              </label>
              <input
                type="text"
                value={settings.telAdmin}
                onChange={(e) => setSettings({ ...settings, telAdmin: e.target.value })}
                style={{
                  width: '100%', padding: '0.8rem', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white', outline: 'none', fontSize: '0.85rem'
                }}
              />
            </div>
          </div>

          <div style={{ marginTop: '1.25rem' }}>
            <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
              ADRESSE GÉOGRAPHIQUE PHYSIQUE
            </label>
            <input
              type="text"
              value={settings.locationAdmin}
              onChange={(e) => setSettings({ ...settings, locationAdmin: e.target.value })}
              style={{
                width: '100%', padding: '0.8rem', borderRadius: '8px',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                color: 'white', outline: 'none', fontSize: '0.85rem'
              }}
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="btn-primary"
          style={{
            padding: '1rem', borderRadius: '8px', fontWeight: 800, fontSize: '1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            marginTop: '1rem'
          }}
        >
          💾 Enregistrer les Modifications Générales
        </button>

      </form>

      <style>{`
        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr !important;
            gap: 1.1rem !important;
          }
        }
      `}</style>
    </div>
  );
}
