import { Html, Head, Main, NextScript } from 'next/document';
import { CDN_CONFIG } from '@/lib/cdn-config';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Resource hints for performance */}
        {CDN_CONFIG.preconnectDomains.map((domain) => (
          <link key={domain} rel="preconnect" href={domain} />
        ))}
        
        {CDN_CONFIG.dnsPrefetchDomains.map((domain) => (
          <link key={domain} rel="dns-prefetch" href={domain} />
        ))}
        
        {/* Preload critical resources */}
        {CDN_CONFIG.preloadResources.map((resource, index) => (
          <link
            key={index}
            rel="preload"
            href={resource.href}
            as={resource.as}
            type={resource.type}
            crossOrigin={resource.crossOrigin as any}
          />
        ))}
        
        {/* Web font optimization */}
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}