export const createWhatsappLink = (message, shareLink) =>
  `https://wa.me/?text=${encodeURIComponent(`${message}\n\n${shareLink}`)}`;
