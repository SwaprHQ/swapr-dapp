import React, { ReactNode } from 'react'

export const InfoGrid = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-wrap gap-6 md:items-center md:justify-between">{children}</div>
)
