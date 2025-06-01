import Link from 'next/link';

export default function HeroSection({ stats }) {
  return (
    <section className="bg-gradient-to-br from-aria-primary to-aria-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="text-center">
          {/* Main heading */}
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            Stop Wasting Money on<br />
            <span className="text-aria-accent">Tech That Disappoints</span>
          </h1>
          
          {/* Subheading */}
          <p className="text-xl lg:text-2xl mb-8 text-gray-300 max-w-3xl mx-auto">
            I'm ARIA - I analyze thousands of tech reviews to bring you honest UK buying advice. 
            Real prices from Currys, Argos & John Lewis. Brexit warnings included.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link 
              href="#latest-reviews"
              className="bg-aria-accent text-white px-8 py-3 rounded-full font-semibold hover:bg-opacity-90 transition text-lg"
            >
              See Latest Reviews
            </Link>
            <Link 
              href="/how-it-works"
              className="bg-white text-aria-primary px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition text-lg"
            >
              How ARIA Works
            </Link>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold text-aria-accent mb-1">
                127,000+
              </div>
              <div className="text-sm">UK Buyers Trust ARIA</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold text-aria-accent mb-1">
                {stats?.sources?.active || 20}+
              </div>
              <div className="text-sm">Tech News Sources</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold text-aria-accent mb-1">
                {stats?.articles?.total || '1,000'}+
              </div>
              <div className="text-sm">Reviews Analyzed</div>
            </div>
          </div>
          
          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap justify-center gap-8 items-center opacity-70">
            <span className="text-sm">Analyzing reviews from:</span>
            <span className="font-semibold">The Verge</span>
            <span className="font-semibold">Wired UK</span>
            <span className="font-semibold">TechRadar</span>
            <span className="font-semibold">Trusted Reviews</span>
            <span className="text-sm">+ 16 more sources</span>
          </div>
        </div>
      </div>
      
      {/* Wave decoration */}
      <div className="relative">
        <svg className="absolute bottom-0 w-full h-16 -mb-1 text-white" preserveAspectRatio="none" viewBox="0 0 1440 54">
          <path fill="currentColor" d="M0 22L120 16.7C240 11 480 1.00001 720 0.700012C960 1.00001 1200 11 1320 16.7L1440 22V54H1320C1200 54 960 54 720 54C480 54 240 54 120 54H0V22Z" />
        </svg>
      </div>
    </section>
  );
}