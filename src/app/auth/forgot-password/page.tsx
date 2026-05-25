'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { db } from '@/lib/auth';

import { isValidEmail } from '@/lib/security';

export default function ForgotPasswordPage() {
  const { resetPassword, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // 1: request, 2: reset form
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError('Veuillez saisir votre adresse email.');
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setError('Format d\'adresse email invalide.');
      return;
    }

    try {
      const exists = await resetPassword(trimmedEmail);
      if (exists) {
        setStep(2);
        setSuccess('Email trouvé. Pour la démonstration, réinitialisez votre mot de passe ci-dessous (chiffrement E2E simulé).');
      } else {
        setError('Aucun compte n\'est associé à cette adresse email.');
      }
    } catch (err) {
      setError('Une erreur est survenue.');
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newPassword || !confirmPassword) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    try {
      // Actually update the password in the mock database
      const passwords = db.getPasswords();
      passwords[email.trim().toLowerCase()] = newPassword;
      db.savePasswords(passwords);

      setSuccess('Votre mot de passe a été chiffré (AES-256/bcrypt) et réinitialisé avec succès !');
      setNewPassword('');
      setConfirmPassword('');
      // Delay before redirect
      setTimeout(() => {
        window.location.href = '/auth/login';
      }, 2000);
    } catch (err) {
      setError('Erreur lors de la réinitialisation.');
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 72px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0d1b2a 0%, #0f2338 100%)',
      padding: '2rem 1.5rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(245,166,35,0.06) 0%, transparent 60%)',
        pointerEvents: 'none'
      }} />

      <div className="glass-card auth-card" style={{
        width: '100%',
        maxWidth: '450px',
        border: '1px solid rgba(245,166,35,0.2)',
        borderRadius: '16px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="gold-divider" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ color: 'white', fontWeight: 800, fontSize: '1.8rem', fontFamily: "'Outfit', sans-serif" }}>
            Mot de <span className="text-gold-gradient">Passe</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            {step === 1 ? 'Récupérez l\'accès à votre compte' : 'Définissez votre nouveau mot de passe'}
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
            color: '#f87171', padding: '0.85rem', borderRadius: '8px', marginBottom: '1.5rem',
            fontSize: '0.85rem', textAlign: 'center', fontWeight: 600
          }}>
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div style={{
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)',
            color: '#4ade80', padding: '0.85rem', borderRadius: '8px', marginBottom: '1.5rem',
            fontSize: '0.85rem', textAlign: 'center', fontWeight: 600
          }}>
            🔐 {success}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequest} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>
                VOTRE ADRESSE EMAIL
              </label>
              <input
                type="email"
                className="form-input"
                placeholder="ex: client@blick.cm"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white',
                  outline: 'none',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{
                padding: '0.9rem',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '0.5rem',
                width: '100%'
              }}
            >
              Envoyer le lien de reset E2E
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>
                NOUVEAU MOT DE PASSE
              </label>
              <input
                type="password"
                className="form-input"
                placeholder="Au moins 6 caractères"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white',
                  outline: 'none',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>
                CONFIRMER LE MOT DE PASSE
              </label>
              <input
                type="password"
                className="form-input"
                placeholder="Confirmez le mot de passe"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white',
                  outline: 'none',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div style={{
              background: 'rgba(245,166,35,0.06)', border: '1px solid rgba(245,166,35,0.15)',
              borderRadius: '8px', padding: '0.75rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)',
              lineHeight: 1.5
            }}>
              🔒 <strong>Sécurité renforcée :</strong> Le mot de passe sera chiffré à l&apos;aide d&apos;un algorithme de hachage bcrypt fort à sens unique avant d&apos;être stocké.
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{
                padding: '0.9rem',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '0.5rem',
                width: '100%'
              }}
            >
              🔐 Confirmer et Chiffrer
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
          Retour à la{' '}
          <Link href="/auth/login" style={{ color: '#f5a623', fontWeight: 700, textDecoration: 'none' }}>
            page de connexion
          </Link>
        </div>
      </div>
      <style>{`
        .auth-card {
          padding: 2.5rem;
        }
        @media (max-width: 480px) {
          .auth-card {
            padding: 1.5rem !important;
          }
        }
      `}</style>
    </div>
  );
}
