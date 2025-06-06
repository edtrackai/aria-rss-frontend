import { redirect } from 'next/navigation'

export default function RevenueOverviewPage() {
  // Redirect to main revenue page (which shows overview by default)
  redirect('/dashboard/revenue')
}