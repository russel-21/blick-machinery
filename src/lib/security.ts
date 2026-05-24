/**
 * Bibliothèque utilitaire de sécurité pour la validation et l'assainissement des entrées.
 */

/**
 * Valide un format d'adresse email standard.
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Valide un format de numéro de téléphone.
 * N'autorise que les chiffres, espaces, parenthèses, tirets et + au début.
 * Exclut toute lettre ou caractère spécial suspect.
 */
export function isValidPhone(phone: string): boolean {
  if (!phone) return false;
  const cleaned = phone.trim();
  const phoneRegex = /^[+\d\s()-]{6,25}$/;
  return phoneRegex.test(cleaned);
}

/**
 * Assainit une URL pour empêcher les XSS de type "javascript:" ou "data:".
 * Utilisé pour tous les liens dynamiques (réseaux sociaux, médias, etc.).
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '#';
  const trimmed = url.trim();

  // Bloquer les protocoles javascript: ou data: (sauf s'il s'agit de base64 légitime pour une image locale)
  if (/^(javascript|vbscript):/i.test(trimmed)) {
    return '#';
  }
  
  if (/^data:/i.test(trimmed) && !trimmed.startsWith('data:image/') && !trimmed.startsWith('data:video/')) {
    return '#';
  }

  // Si c'est un lien relatif, un protocole web valide, ou mailto/tel, c'est bon
  if (/^(https?:\/\/|\/|mailto:|tel:)/i.test(trimmed)) {
    return trimmed;
  }

  // Corriger automatiquement les URLs écrites sans protocole (ex: wa.me, facebook.com)
  if (/^(wa\.me|instagram\.com|facebook\.com|tiktok\.com|youtube\.com)/i.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return trimmed;
}

/**
 * Nettoie une chaîne de caractères et limite sa longueur.
 * Évite les spams de stockage et le bris de mise en page (layout overflow).
 */
export function sanitizeInput(text: string, maxLength = 2000): string {
  if (!text) return '';
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  return trimmed.substring(0, maxLength);
}
