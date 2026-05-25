'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

import { isValidEmail } from '@/lib/security';

export default function LoginPage() {
  const { login, loginWithGoogle, user, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [googleCustom, setGoogleCustom] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // If user is already logged in, redirect to home or admin dashboard
    if (user) {
      if (['admin', 'editor', 'negotiator'].includes(user.role)) {
        router.push('/admin');
      } else if (user.role === 'client') {
        router.push('/dashboard');
      } else {
        router.push('/');
      }
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setError('Veuillez saisir un format d\'adresse email valide.');
      return;
    }

    try {
      const success = await login(trimmedEmail, password, rememberMe);
      if (success) {
        setSuccess(true);
        // Redirect will happen via useEffect on user change
      } else {
        setError('Identifiants incorrects. Veuillez réessayer.');
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la connexion.');
    }
  };

  const handleGoogleLogin = () => {
    setError('');
    setGoogleCustom(false);
    setShowGoogleModal(true);
  };

  const handleGoogleSelect = async (gEmail: string, gName: string) => {
    setShowGoogleModal(false);
    setError('');
    try {
      const success = await loginWithGoogle(gEmail, gName);
      if (success) {
        setSuccess(true);
      } else {
        setError('Connexion Google annulée ou échouée.');
      }
    } catch (err) {
      setError('Erreur lors de la connexion avec Google.');
    }
  };

  const handleCustomGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmail || !googleName) return;
    await handleGoogleSelect(googleEmail.trim(), googleName.trim());
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
        maxWidth: '450px',
        border: '1px solid rgba(245,166,35,0.2)',
        borderRadius: '16px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="gold-divider" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ color: 'white', fontWeight: 800, fontSize: '1.8rem', fontFamily: "'Outfit', sans-serif" }}>
            Se <span className="text-gold-gradient">Connecter</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Accédez à votre espace client ou administration
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
            🎉 Connexion réussie ! Redirection...
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>
              ADRESSE EMAIL
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

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                MOT DE PASSE
              </label>
              <Link href="/auth/forgot-password" style={{ color: '#f5a623', fontSize: '0.78rem', textDecoration: 'none', fontWeight: 600 }}>
                Mot de passe oublié ?
              </Link>
            </div>
            <input
              type="password"
              className="form-input"
              placeholder="Saisissez votre mot de passe"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
            {loading ? 'Connexion en cours...' : '🔐 Se connecter'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0', color: 'rgba(255,255,255,0.3)' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>OU</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
        </div>

        {/* Google OAuth Button */}
        <button
          onClick={handleGoogleLogin}
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
          Se connecter avec Google
        </button>

        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
          Vous n&apos;avez pas de compte ?{' '}
          <Link href="/auth/register" style={{ color: '#f5a623', fontWeight: 700, textDecoration: 'none' }}>
            Créer une fiche d&apos;inscription
          </Link>
        </div>
      </div>

      {showGoogleModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            color: '#1f2937',
            width: '100%',
            maxWidth: '400px',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
            position: 'relative',
            fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
          }}>
            <button
              onClick={() => setShowGoogleModal(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'transparent',
                border: 'none',
                fontSize: '1.25rem',
                cursor: 'pointer',
                color: '#9ca3af'
              }}
            >
              ✕
            </button>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" style={{ margin: '0 auto 0.75rem' }}>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6-2.87-4.53-5.01-4.53z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#202124' }}>
                Choisissez un compte
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#5f6368', marginTop: '0.25rem' }}>
                pour continuer vers Blick Machinery
              </p>
            </div>

            {!googleCustom ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { name: 'Jean Dupont', email: 'jean.dupont@gmail.com', avatar: 'JD' },
                  { name: 'Marie Ngo', email: 'marie.ngo@gmail.com', avatar: 'MN' },
                  { name: 'Diallo Mamadou', email: 'diallo.mamadou@gmail.com', avatar: 'DM' }
                ].map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleGoogleSelect(acc.email, acc.name)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #dadce0',
                      background: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8f9fa')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: '#e8f0fe',
                      color: '#1a73e8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 600,
                      fontSize: '0.85rem'
                    }}>
                      {acc.avatar}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#3c4043' }}>{acc.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#5f6368', textOverflow: 'ellipsis', overflow: 'hidden' }}>{acc.email}</div>
                    </div>
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setGoogleCustom(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px dashed #dadce0',
                    background: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: '#1a73e8',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8f9fa')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  👤 Utiliser un autre compte
                </button>
              </div>
            ) : (
              <form onSubmit={handleCustomGoogleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#5f6368', display: 'block', marginBottom: '0.25rem' }}>
                    NOM COMPLET
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Paul Biya"
                    value={googleName}
                    onChange={(e) => setGoogleName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem',
                      borderRadius: '4px',
                      border: '1px solid #dadce0',
                      outline: 'none',
                      fontSize: '0.9rem',
                      color: '#1f2937',
                      background: '#ffffff'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#5f6368', display: 'block', marginBottom: '0.25rem' }}>
                    ADRESSE EMAIL GOOGLE
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="ex: paul.biya@gmail.com"
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem',
                      borderRadius: '4px',
                      border: '1px solid #dadce0',
                      outline: 'none',
                      fontSize: '0.9rem',
                      color: '#1f2937',
                      background: '#ffffff'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setGoogleCustom(false)}
                    style={{
                      flex: 1,
                      padding: '0.65rem',
                      borderRadius: '4px',
                      border: '1px solid #dadce0',
                      background: 'none',
                      cursor: 'pointer',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      color: '#5f6368'
                    }}
                  >
                    Retour
                  </button>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      padding: '0.65rem',
                      borderRadius: '4px',
                      border: 'none',
                      background: '#1a73e8',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '0.88rem',
                      fontWeight: 600
                    }}
                  >
                    Suivant
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

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
