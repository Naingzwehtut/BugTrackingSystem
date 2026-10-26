/**
 * Table building blocks shared by the bug list and the users page, so header
 * styling, row hover and the horizontal-scroll wrapper are defined once.
 *
 *   <Table>
 *     <thead><tr><Th>Name</Th><Th className="text-right">Role</Th></tr></thead>
 *     <tbody>...<Td>...</Td></tbody>
 *   </Table>
 */
export function Table({ children, className = '' }) {
  // `relative` matters: without a positioned ancestor, absolutely positioned
  // children (e.g. `sr-only` header labels) escape the scroll container and
  // make the whole page scroll sideways on phones.
  return (
    <div className={`card relative overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200 text-sm">{children}</table>
    </div>
  )
}

export function TableHead({ children }) {
  return (
    <thead className="bg-gray-50/80">
      <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{children}</tr>
    </thead>
  )
}

export function Th({ children, className = '' }) {
  return (
    <th scope="col" className={`whitespace-nowrap px-4 py-3 ${className}`}>
      {children}
    </th>
  )
}

export function TableBody({ children }) {
  return <tbody className="divide-y divide-gray-100 bg-white">{children}</tbody>
}

export function Td({ children, className = '' }) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>
}
