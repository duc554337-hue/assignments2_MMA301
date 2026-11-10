export const palette = {
  ink: '#182824',
  muted: '#77817A',
  paper: '#F5F4EF',
  surface: '#FCFBF7',
  line: '#E4E3DC',
  green: '#28614A',
  greenSoft: '#E0E9DF',
  coral: '#D96D4E',
  lemon: '#F0C95A',
  error: '#A43F35',
  errorSoft: '#F8E5E0',
};

export const pagePadding = 20;

export function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(price) || 0);
}