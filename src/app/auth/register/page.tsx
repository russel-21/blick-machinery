'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

import { isValidEmail, isValidPhone, sanitizeInput } from '@/lib/security';

export default function RegisterPage() {
  const { register, loginWithGoogle, user, loading } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('Cameroun');
  const [company, setCompany] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      if (['admin', 'editor', 'negotiator'].includes(user.role)) {
        router.push('/admin');
      } else {
        router.push('/');
      }
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Trim and sanitize inputs
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    const trimmedCompany = company.trim();

    if (!trimmedName || !trimmedEmail || !password || !trimmedPhone) {
      setError('Veuillez remplir tous les champs obligatoires (*).');
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setError('Format de l\'adresse email invalide.');
      return;
    }

    if (!isValidPhone(trimmedPhone)) {
      setError('Le numéro de téléphone est invalide. Utilisez uniquement des chiffres, des espaces, des tirets ou des parenthèses, avec éventuellement un + au début.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    try {
      const isSuccess = await register({
        name: sanitizeInput(trimmedName, 100),
        email: trimmedEmail.toLowerCase(),
        password,
        phone: sanitizeInput(trimmedPhone, 30),
        country,
        company: sanitizeInput(trimmedCompany, 100),
        rememberMe
      });

      if (isSuccess) {
        setSuccess(true);
        // Redirect will happen via useEffect on user change
      } else {
        setError('Cet email est déjà enregistré.');
      }
    } catch (err) {
      setError('Une erreur est survenue lors de l\'inscription.');
    }
  };

  const handleGoogleSignup = async () => {
    setError('');
    try {
      const isSuccess = await loginWithGoogle();
      if (isSuccess) {
        setSuccess(true);
      } else {
        setError('Inscription Google annulée ou échouée.');
      }
    } catch (err) {
      setError('Erreur lors de la connexion Google.');
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
      {/* Background radial highlights */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(245,166,35,0.06) 0%, transparent 60%)',
        pointerEvents: 'none'
      }} />

      <div className="glass-card auth-card" style={{
        width: '100%',
        maxWidth: '550px',
        border: '1px solid rgba(245,166,35,0.2)',
        borderRadius: '16px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="gold-divider" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ color: 'white', fontWeight: 800, fontSize: '1.8rem', fontFamily: "'Outfit', sans-serif" }}>
            Fiche d&apos;<span className="text-gold-gradient">Inscription</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Remplissez les détails ci-dessous pour créer votre profil client
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
            🎉 Inscription réussie ! Création de session...
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="form-grid">
            <div>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>
                NOM COMPLET *
              </label>
              <input
                type="text"
                placeholder="ex: Jean Dupont"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white',
                  outline: 'none',
                  fontSize: '0.85rem'
                }}
              />
            </div>
            
            <div>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>
                TÉLÉPHONE *
              </label>
              <input
                type="tel"
                placeholder="ex: +237 6 XX XX XX XX"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white',
                  outline: 'none',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>
              ADRESSE EMAIL *
            </label>
            <input
              type="email"
              placeholder="ex: jean.dupont@gmail.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.8rem 1rem',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'white',
                outline: 'none',
                fontSize: '0.85rem'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="form-grid">
            <div>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>
                PAYS *
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem',
                  borderRadius: '8px',
                  background: '#0d1b2a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white',
                  outline: 'none',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                <option value="Cameroun">Cameroun</option>
                <option value="Sénégal">Sénégal</option>
                <option value="Côte d'Ivoire">Côte d&apos;Ivoire</option>
                <option value="Mali">Mali</option>
                <option value="Burkina Faso">Burkina Faso</option>
                <option value="Gabon">Gabon</option>
                <option value="Guinée">Guinée</option>
                <option value="Togo">Togo</option>
                <option value="Bénin">Bénin</option>
                <option value="Autre">Autre Afrique</option>
              </select>
            </div>

            <div>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>
                ENTREPRISE (OPTIONNEL)
              </label>
              <input
                type="text"
                placeholder="ex: BTP Cameroun SA"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white',
                  outline: 'none',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="form-grid">
            <div>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>
                MOT DE PASSE *
              </label>
              <input
                type="password"
                placeholder="Au moins 6 caractères"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white',
                  outline: 'none',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <div>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>
                CONFIRMER LE MOT DE PASSE *
              </label>
              <input
                type="password"
                placeholder="Confirmez"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white',
                  outline: 'none',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          </div>

          <div style={{ marginTop: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  accentColor: '#f5a623',
                  width: '16px',
                  height: '16px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              />
              Se souvenir de moi
            </label>
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
            {loading ? 'Inscription en cours...' : '📝 Créer mon compte'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0', color: 'rgba(255,255,255,0.3)' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>OU</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
        </div>

        {/* Google OAuth Button */}
        <button
          onClick={handleGoogleSignup}
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.85rem',
            borderRadius: '8px',
            background: 'white',
            color: '#1f2937',
            border: 'none',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          {/* Google Icon */}
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#EA4335" d="M9 3.48c1.69 0 2.83.73 3.48 1.34l2.61-2.61C13.51.81 11.47 0 9 0 5.48 0 2.44 2.02.96 4.96l3.07 2.38C4.78 4.96 6.69 3.48 9 3.48z"/>
            <path fill="#4285F4" d="M17.64 9.2c0-.74-.06-1.28-.19-1.84H9v3.47h4.88c-.21 1.09-.82 2.01-1.74 2.62l2.7 2.1C16.42 13.9 17.64 11.83 17.64 9.2z"/>
            <path fill="#FBBC05" d="M3.88 10.78a5.54 5.54 0 010-3.56L.81 4.84a9.003 9.003 0 000 8.32l3.07-2.38z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.7-2.1c-.75.5-1.71.8-3.26.8-2.31 0-4.22-1.48-4.92-3.86L1.01 13.04C2.49 15.98 5.53 18 9 18z"/>
          </svg>
          S&apos;inscrire avec Google
        </button>

        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
          Vous avez déjà un compte ?{' '}
          <Link href="/auth/login" style={{ color: '#f5a623', fontWeight: 700, textDecoration: 'none' }}>
            Se connecter
          </Link>
        </div>
      </div>

      <style>{`
        .auth-card {
          padding: 2.5rem;
        }
        @media (max-width: 580px) {
          .form-grid {
            grid-template-columns: 1fr !important;
            gap: 1.1rem !important;
          }
          .auth-card {
            padding: 1.5rem !important;
          }
        }
      `}</style>
    </div>
  );
}
