'use client'

import type { ReactNode } from 'react'

export function MigrationTable({ headers, children }: {
  headers: [string, string]
  children: ReactNode
}) {
  return (
    <table>
      <thead>
        <tr>
          <th className="w-50">{headers[0]}</th>
          <th>{headers[1]}</th>
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  )
}

interface MigrationRowProps {
  method: ReactNode
  children: ReactNode
}

export function MigrationRow({ method, children }: MigrationRowProps) {
  return (
    <tr>
      <td>{method}</td>
      <td>{children}</td>
    </tr>
  )
}

export function MigrationCell({ className, children }: {
  className?: string
  children: ReactNode
}) {
  return <div className={className}>{children}</div>
}
