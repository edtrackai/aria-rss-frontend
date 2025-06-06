'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RevenueLinksPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main revenue page with the links tab active
    router.push('/dashboard/revenue?tab=links');
  }, [router]);

  return null;
}