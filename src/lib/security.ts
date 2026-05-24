/**
 * Bibliothèque utilitaire de sécurité pour la validation et l'assainissement des entrées.
 */

/**
 * Supprime tous les emojis d'une chaîne de caractères.
 */
export function stripEmojis(text: string): string {
  if (!text) return '';
  // Expression régulière pour capturer les plages d'emojis Unicode courantes et étendues
  const emojiRegex = /[\u{1F300}-\u{1FAFF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F1E6}-\u{1F1FF}]/gu;
  return text.replace(emojiRegex, '');
}

/**
 * Supprime les caractères spéciaux (', ", <, >, &, `, \, {, }, [, ], $) d'un texte.
 * L'apostrophe est également retirée selon la checklist stricte demandée.
 */
export function stripSpecialChars(text: string): string {
  if (!text) return '';
  return text.replace(/[<>&"'\`\\\{\}\[\]\$]/g, '');
}

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
  let trimmed = url.trim();

  // Bloquer les protocoles javascript: ou data: (sauf base64 légitime pour les fichiers locaux)
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
 * Nettoie une chaîne de caractères, supprime les emojis et les caractères spéciaux,
 * et limite sa longueur pour éviter les débordements de stockage ou d'interface.
 */
export function sanitizeInput(text: string, maxLength = 2000, isEmail = false): string {
  if (!text) return '';
  
  // 1. Trim des espaces blancs au début/à la fin
  let cleaned = text.trim();
  
  // 2. Retrait des emojis partout
  cleaned = stripEmojis(cleaned);
  
  // 3. Retrait des caractères spéciaux (sauf s'il s'agit d'une adresse email)
  if (!isEmail) {
    cleaned = stripSpecialChars(cleaned);
  }
  
  // 4. Limitation stricte de longueur
  if (cleaned.length <= maxLength) {
    return cleaned;
  }
  return cleaned.substring(0, maxLength);
}
