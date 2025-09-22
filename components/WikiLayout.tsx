'use client'

import { ReactNode } from 'react'

interface WikiLayoutProps {
  children: ReactNode
}

export function WikiLayout({ children }: WikiLayoutProps) {
  return (
    <div className="wiki-container">
      {children}
    </div>
  )
}
