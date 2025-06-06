import Link from 'next/link'
import { Button } from '@/components/cms/ui/button'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
            AI-Reviewed CMS
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Enhanced with AI-powered content management
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Public Site</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                View the public review site (existing functionality)
              </p>
              <Link href="/reviews" className="inline-block">
                <Button>View Reviews</Button>
              </Link>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4">CMS Dashboard</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Access the AI-powered admin dashboard
              </p>
              <Link href="/dashboard" className="inline-block">
                <Button variant="outline">Open Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
