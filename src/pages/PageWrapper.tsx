import React, { ReactNode } from 'react'

export const PageWrapper = ({ children }: { children: ReactNode }) => (
  <div className="mx-auto w-full max-w-4xl">{children}</div>
)
