export const TOTAL_COUNT_HEADER_NAME = 'x-total-count';
export const NEXT_PAGE_HEADER_NAME = 'x-next-page';
export const PAGE_HEADER_NAME = 'x-page';
export const PAGES_COUNT_HEADER_NAME = 'x-pages-count';
export const PER_PAGE_HEADER_NAME = 'x-per-page';
export const CORS_EXPOSED_HEADERS =
  `${NEXT_PAGE_HEADER_NAME},${PAGE_HEADER_NAME},${PAGES_COUNT_HEADER_NAME},` +
  `${PER_PAGE_HEADER_NAME},${TOTAL_COUNT_HEADER_NAME}`;

export const escapeRegExp = (input?: string) => {
  if (!input) return '.';
  return input.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

export const randomCode = (length: number) => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};
