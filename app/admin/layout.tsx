import { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <div className="min-h-screen bg-[#050505]">
          {children}
        </div>
      </body>
    </html>
  );
}
