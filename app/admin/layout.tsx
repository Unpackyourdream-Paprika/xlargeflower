'use client';

import { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050505] -mt-16">
      {children}
    </div>
  );
}
