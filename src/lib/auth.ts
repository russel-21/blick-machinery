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
  installments: {
    id: string;
    amount: number;
    dueDate: string;
    paidDate?: string;
    status: 'pending' | 'paid';
  }[];
}

// Simulated User database in localStorage
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
  },
  {
    id: 'usr_nego',
    name: 'Samuel Eto\'o',
    email: 'negotiator@blick.cm',
    phone: '+237 6 77 77 77 77',
    country: 'Cameroun',
    company: 'Blick Machinery',
    role: 'negotiator',
    createdAt: '2026-05-10T14:30:00Z'
  },
  {
    id: 'usr_client',
    name: 'Amadou Diallo',
    email: 'client@blick.cm',
    phone: '+221 77 123 45 67',
    country: 'Sénégal',
    company: 'Diallo & Fils BTP',
    role: 'client',
    createdAt: '2026-05-15T09:15:00Z'
  }
];

const DEFAULT_PAYMENTS: InstallmentPayment[] = [
  {
    id: 'pay_1',
    machineId: '1',
    machineName: 'Granuleuse Industrielle Blick-1200',
    totalAmount: 45000,
    paidAmount: 15000,
    negotiatorName: 'Samuel Eto\'o',
    status: 'partially_paid',
    installments: [
      { id: 'inst_1_1', amount: 15000, dueDate: '2026-05-20', paidDate: '2026-05-20', status: 'paid' },
      { id: 'inst_1_2', amount: 15000, dueDate: '2026-06-20', status: 'pending' },
      { id: 'inst_1_3', amount: 15000, dueDate: '2026-07-20', status: 'pending' }
    ]
  }
];

// Helper to interact with LocalStorage safe for SSR
export const db = {
  getUsers: (): User[] => {
    if (typeof window === 'undefined') return DEFAULT_USERS;
    const usersJson = localStorage.getItem('blick_users');
    if (!usersJson) {
      localStorage.setItem('blick_users', JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    return JSON.parse(usersJson);
  },

  saveUsers: (users: User[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('blick_users', JSON.stringify(users));
    }
  },

  getPayments: (): InstallmentPayment[] => {
    if (typeof window === 'undefined') return DEFAULT_PAYMENTS;
    const payJson = localStorage.getItem('blick_payments');
    if (!payJson) {
      localStorage.setItem('blick_payments', JSON.stringify(DEFAULT_PAYMENTS));
      return DEFAULT_PAYMENTS;
    }
    return JSON.parse(payJson);
  },

  savePayments: (payments: InstallmentPayment[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('blick_payments', JSON.stringify(payments));
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

  getPasswords: (): Record<string, string> => {
    const strongAdminPw = 'Blick#Machinery@Admin&2026!';
    if (typeof window === 'undefined') return {
      'admin@blick.cm': strongAdminPw,
      'negotiator@blick.cm': 'nego123',
      'client@blick.cm': 'client123'
    };
    const pwJson = localStorage.getItem('blick_passwords');
    if (!pwJson) {
      const defaultPw = {
        'admin@blick.cm': strongAdminPw,
        'negotiator@blick.cm': 'nego123',
        'client@blick.cm': 'client123'
      };
      localStorage.setItem('blick_passwords', JSON.stringify(defaultPw));
      return defaultPw;
    }
    const parsed = JSON.parse(pwJson);
    // Migration automatique pour remplacer le mot de passe faible d'origine
    if (parsed['admin@blick.cm'] === 'admin123') {
      parsed['admin@blick.cm'] = strongAdminPw;
      localStorage.setItem('blick_passwords', JSON.stringify(parsed));
    }
    return parsed;
  },

  savePasswords: (passwords: Record<string, string>) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('blick_passwords', JSON.stringify(passwords));
    }
  },

  getSettings: () => {
    const defaultSettings = {
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
    if (typeof window === 'undefined') return defaultSettings;
    const settingsJson = localStorage.getItem('blick_settings');
    if (!settingsJson) {
      localStorage.setItem('blick_settings', JSON.stringify(defaultSettings));
      return defaultSettings;
    }
    return JSON.parse(settingsJson);
  },

  saveSettings: (settings: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('blick_settings', JSON.stringify(settings));
    }
  }
};
