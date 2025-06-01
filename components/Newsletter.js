import { useState } from 'react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setStatus('error');
      return;
    }
    
    setLoading(true);
    
    try {
      // In production, integrate with your email service (Mailchimp, ConvertKit, etc.)
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (response.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-aria-secondary text-white rounded-lg p-8 my-8">
      <div className="max-w-2xl mx-auto text-center">
        <h3 className="text-2xl font-bold mb-4">
          🎯 Never Miss a Deal or Warning
        </h3>
        <p className="mb-6">
          Join 127,000+ UK tech buyers who get my daily insights on the best deals, 
          price drops, and products to avoid. No spam, ever.
        </p>
        
        {status === 'success' ? (
          <div className="bg-aria-success text-white p-4 rounded-lg">
            <p className="font-semibold">Brilliant! Check your email to confirm.</p>
            <p className="text-sm mt-1">
              You'll start getting ARIA's daily tech brief tomorrow morning.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 px-4 py-3 rounded-full text-gray-900 focus:outline-none focus:ring-4 focus:ring-aria-accent"
              disabled={loading}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-white text-aria-secondary px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition disabled:opacity-50"
            >
              {loading ? 'Subscribing...' : 'Get Daily Updates'}
            </button>
          </form>
        )}
        
        {status === 'error' && (
          <p className="text-red-200 text-sm mt-4">
            Something went wrong. Please try again or email hello@ai-reviewed.com
          </p>
        )}
        
        <p className="text-xs mt-4 opacity-80">
          I respect your inbox. Unsubscribe anytime with one click.
        </p>
      </div>
    </div>
  );
}