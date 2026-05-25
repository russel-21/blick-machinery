'use client';

export type UserRole = 'admin' | 'editor' | 'negotiator' | 'client' | 'visitor';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  country?: string;
  company?: string;
  role: UserRole;
  createdAt: string;
  isGoogleUser?: boolean;
}

export interface InstallmentPayment {
  id: string;
  machineId: string;
  machineName: string;
  totalAmount: number;
  paidAmount: number;
  negotiatorName: string;
  status: 'pending' | 'partially_paid' | 'paid';
  clientId?: string;
  depositAmount?: number;
  depositStatus?: 'pending' | 'paid';
  installments: {
    id: string;
    amount: number;
    dueDate: string;
    paidDate?: string;
    status: 'pending' | 'paid';
  }[];
}

export interface Quote {
  id: string;
  nom: string;
  email: string;
  telephone: string;
  type: 'machine' | 'materiel';
  machine: string; // Product ID
  machineName: string;
  message: string;
  status: 'pending' | 'processing' | 'approved' | 'expired';
  createdAt: string;
}

export interface SAVTicket {
  id: string;
  clientId: string;
  clientName: string;
  machineName: string;
  type: 'panne' | 'maintenance' | 'installation' | 'pieces';
  urgency: 'low' | 'medium' | 'high';
  desc: string;
  status: 'open' | 'technician_assigned' | 'resolved';
  createdAt: string;
}

const DEFAULT_USERS: User[] = [
  {
    id: 'usr_admin',
    name: 'Admin Blick',
    email: 'admin@blick.cm',
    phone: '+237 6 99 95 20 90',
    country: 'Cameroun',
    company: 'Blick Machinery',
    role: 'admin',
    createdAt: '2026-05-01T12:00:00Z'
  }
];

const DEFAULT_SETTINGS = {
  aboutText: "Blick Machinery Cameroon SARL est une structure leader dans la distribution de machines industrielles et d'équipements lourds partout en Afrique. En tant que filiale officielle de Blick Refractory Technology (Chine), nous combinons l'excellence de la technologie industrielle de pointe avec un service local d'une réactivité sans faille.",
  aboutMission: "Fournir des équipements industriels de qualité supérieure, fiables et à des prix compétitifs pour accompagner le développement économique de l'Afrique.",
  aboutVision: "Devenir le partenaire numéro un pour l'équipement industriel lourd en Afrique de l'Ouest et Centrale.",
  facebookUrl: "https://www.facebook.com/sistenar",
  whatsappNumber: "+237699952090",
  tiktokUrl: "#",
  instagramUrl: "#",
  youtubeUrl: "#",
  emailAdmin: "contact@blickmachinery.cm",
  telAdmin: "+237 6 99 95 20 90",
  locationAdmin: "Stade Militi, Nditam, Douala, Cameroun"
};

// Helper to interact with Server Database safe for SSR
export const db = {
  getUsers: async (): Promise<User[]> => {
    if (typeof window === 'undefined') return DEFAULT_USERS;
    try {
      const res = await fetch(`/api/db?key=users&t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      return data.users || DEFAULT_USERS;
    } catch {
      return DEFAULT_USERS;
    }
  },

  saveUsers: async (users: User[]): Promise<void> => {
    if (typeof window !== 'undefined') {
      try {
        await fetch('/api/db', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'users', data: users })
        });
      } catch (err) {
        console.error('Error saving users:', err);
      }
    }
  },

  getPayments: async (): Promise<InstallmentPayment[]> => {
    if (typeof window === 'undefined') return [];
    try {
      const res = await fetch(`/api/db?key=payments&t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      return data.payments || [];
    } catch {
      return [];
    }
  },

  savePayments: async (payments: InstallmentPayment[]): Promise<void> => {
    if (typeof window !== 'undefined') {
      try {
        await fetch('/api/db', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'payments', data: payments })
        });
      } catch (err) {
        console.error('Error saving payments:', err);
      }
    }
  },

  getSession: (): User | null => {
    if (typeof window === 'undefined') return null;
    const sessionJson = localStorage.getItem('blick_session');
    if (!sessionJson) return null;
    try {
      return JSON.parse(sessionJson);
    } catch {
      return null;
    }
  },

  setSession: (user: User | null, rememberMe = false) => {
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem('blick_session', JSON.stringify(user));
        if (rememberMe) {
          localStorage.setItem('blick_remember', 'true');
        }
      } else {
        localStorage.removeItem('blick_session');
        localStorage.removeItem('blick_remember');
      }
    }
  },

  getPasswords: async (): Promise<Record<string, string>> => {
    const defaultPw = { 'admin@blick.cm': 'Blick#Machinery@Admin&2026!' };
    if (typeof window === 'undefined') return defaultPw;
    try {
      const res = await fetch(`/api/db?key=passwords&t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      return data.passwords || defaultPw;
    } catch {
      return defaultPw;
    }
  },

  savePasswords: async (passwords: Record<string, string>): Promise<void> => {
    if (typeof window !== 'undefined') {
      try {
        await fetch('/api/db', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'passwords', data: passwords })
        });
      } catch (err) {
        console.error('Error saving passwords:', err);
      }
    }
  },

  getSettings: async (): Promise<any> => {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    try {
      const res = await fetch(`/api/db?key=settings&t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      return data.settings || DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings: async (settings: any): Promise<void> => {
    if (typeof window !== 'undefined') {
      try {
        await fetch('/api/db', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'settings', data: settings })
        });
      } catch (err) {
        console.error('Error saving settings:', err);
      }
    }
  },

  getQuotes: async (): Promise<Quote[]> => {
    if (typeof window === 'undefined') return [];
    try {
      const res = await fetch(`/api/db?key=quotes&t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      return data.quotes || [];
    } catch {
      return [];
    }
  },

  saveQuotes: async (quotes: Quote[]): Promise<void> => {
    if (typeof window !== 'undefined') {
      try {
        await fetch('/api/db', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'quotes', data: quotes })
        });
      } catch (err) {
        console.error('Error saving quotes:', err);
      }
    }
  },

  getTickets: async (): Promise<SAVTicket[]> => {
    if (typeof window === 'undefined') return [];
    try {
      const res = await fetch(`/api/db?key=tickets&t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      return data.tickets || [];
    } catch {
      return [];
    }
  },

  saveTickets: async (tickets: SAVTicket[]): Promise<void> => {
    if (typeof window !== 'undefined') {
      try {
        await fetch('/api/db', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'tickets', data: tickets })
        });
      } catch (err) {
        console.error('Error saving SAV tickets:', err);
      }
    }
  },

  cleanFictionalData: async (): Promise<any> => {
    if (typeof window === 'undefined') return null;
    try {
      const res = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cleanFictional' })
      });
      return await res.json();
    } catch (err) {
      console.error('Error cleaning demo data:', err);
      return null;
    }
  }
};
