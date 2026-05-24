'use client';

import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const menuItems = [
  { href: '/admin', label: '📊 Tableau de Bord', roles: ['admin', 'negotiator', 'editor'] },
  { href: '/admin/utilisateurs', label: '👥 Utilisateurs & Rôles', roles: ['admin'] },
  { href: '/admin/medias', label: '🖼️ Gestion Médias', roles: ['admin', 'editor'] },
  { href: '/admin/paiements', label: '💰 Paiements en Tranches', roles: ['admin', 'negotiator'] },
  { href: '/admin/parametres', label: '⚙️ Configuration Vitrine', roles: ['admin', 'editor'] },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, mounted, router]);

  if (!mounted || loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#0d1b2a', color: 'white', fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="animate-spin" style={{
            width: '40px', height: '40px', border: '4px solid rgba(245,166,35,0.1)',
            borderTopColor: '#f5a623', borderRadius: '50%', margin: '0 auto 1rem'
          }} />
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>Chargement de l&apos;espace d&apos;administration...</p>
        </div>
      </div>
    );
  }

  // Guard against non-admin roles
  const hasAccess = user && ['admin', 'editor', 'negotiator'].includes(user.role);

  if (!hasAccess) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#0d1b2a', color: 'white', fontFamily: "'Inter', sans-serif", padding: '1.5rem'
      }}>
        <div className="glass-card" style={{
          maxWidth: '500px', padding: '3rem', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '16px', textAlign: 'center'
        }}>
          <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1.5rem' }}>🚫</span>
          <h2 style={{ color: '#f87171', fontWeight: 800, fontSize: '1.8rem', marginBottom: '1rem', fontFamily: "'Outfit', sans-serif" }}>
            Accès Refusé (403)
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: '2rem' }}>
            Désolé, vous ne possédez pas les autorisations nécessaires pour accéder à l&apos;espace d&apos;administration. Votre rôle actuel est : <strong>{user?.role.toUpperCase()}</strong>.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ padding: '0.8rem 1.5rem' }}>Retour à l&apos;accueil</button>
            </Link>
            <button onClick={() => window.location.href = '/auth/login'} className="btn-outline" style={{ padding: '0.8rem 1.5rem' }}>Changer de compte</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', background: '#0a1628',
      color: 'white', fontFamily: "'Inter', sans-serif"
    }}>
      {/* Sidebar */}
      <aside style={{
        width: '280px', flexShrink: 0, background: '#0d1b2a',
        borderRight: '1px solid rgba(245,166,35,0.15)', display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh'
      }}>
        {/* Sidebar Header with Logo */}
        <div style={{
          padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', gap: '0.75rem'
        }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden',
            background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(245,166,35,0.3)', flexShrink: 0
          }}>
            <Image src="/logo.jpg" alt="Logo" width={40} height={40} style={{ objectFit: 'contain' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, margin: 0, letterSpacing: '0.05em' }}>BLICK MACHINERY</h3>
            <span style={{ fontSize: '0.65rem', color: '#f5a623', fontWeight: 700 }}>ESPACE GESTION</span>
          </div>
        </div>

        {/* User Card */}
        <div style={{
          padding: '1.25rem 1.5rem', background: 'rgba(255,255,255,0.02)',
          borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '0.75rem'
        }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(245,166,35,0.15)',
            border: '1px solid rgba(245,166,35,0.4)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '1.1rem', fontWeight: 800, color: '#f5a623'
          }}>
            {user?.name.charAt(0)}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.name}</div>
            <div style={{ fontSize: '0.68rem', color: '#f5a623', fontWeight: 600 }}>{user?.role.toUpperCase()}</div>
          </div>
        </div>

        {/* Menu Links */}
        <nav style={{ flex: 1, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const hasRoleAccess = item.roles.includes(user?.role || '');
            if (!hasRoleAccess) return null;

            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'block', padding: '0.85rem 1rem', borderRadius: '8px',
                  color: isActive ? '#0d1b2a' : 'rgba(255,255,255,0.7)',
                  background: isActive ? '#f5a623' : 'transparent',
                  fontWeight: isActive ? 700 : 500, fontSize: '0.88rem',
                  textDecoration: 'none', transition: 'all 0.2s ease',
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div style={{ padding: '1.5rem 1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'block', marginBottom: '0.5rem' }}>
            <button className="btn-outline" style={{ width: '100%', padding: '0.75rem', fontSize: '0.8rem', fontWeight: 700 }}>
              🌐 Retourner au Site
            </button>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '2.5rem', overflowY: 'auto', height: '100vh' }}>
        {children}
      </main>
    </div>
  );
}
