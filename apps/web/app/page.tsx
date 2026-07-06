'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authApi } from '@/lib/api/auth';

function RootInner() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = authApi.getToken();
    if (token && pathname === '/') {
      router.replace('/patient-queue');
    } else if (!token && pathname === '/') {
      router.replace('/login');
    }
  }, [router, pathname]);

  return null;
}

export default function RootPage() {
  return (
    <Suspense fallback={null}>
      <RootInner />
    </Suspense>
  );
}
