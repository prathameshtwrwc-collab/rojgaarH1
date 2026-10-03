import { useEffect, useMemo, useState } from 'react';

/**
 * Pages a list on the client. Goes back to page 1 when the list length changes
 * (for example after a search or filter), and never sits past the last page.
 */
export function usePagination<T>(items: T[], pageSize = 10) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(page, pageCount);

  useEffect(() => {
    setPage(1);
  }, [items.length]);

  const pageItems = useMemo(
    () => items.slice((current - 1) * pageSize, current * pageSize),
    [items, current, pageSize],
  );

  return { pageItems, page: current, setPage, pageSize, total: items.length };
}
