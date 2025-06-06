'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RevenueAnalyticsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main revenue page with the products tab active
    router.push('/dashboard/revenue?tab=products');
  }, [router]);

  return null;
}