'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RevenuePayoutsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main revenue page with the payouts tab active
    router.push('/dashboard/revenue?tab=payouts');
  }, [router]);

  return null;
}