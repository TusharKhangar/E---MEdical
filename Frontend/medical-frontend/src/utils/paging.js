/** Wraps an in-memory list in the same page shape the paged API returns, for short client-side lists. */
export const pageOf = (rows, page, size) => ({
  content: rows.slice(page * size, (page + 1) * size),
  page,
  size,
  totalElements: rows.length,
  totalPages: Math.ceil(rows.length / size),
});
