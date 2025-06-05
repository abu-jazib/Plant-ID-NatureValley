
"use client";

import React, { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle?: { [key: string]: unknown }[];
  }
}

interface AdSenseUnitProps {
  adClient: string; // e.g., "ca-pub-YOUR_PUBLISHER_ID"
  adSlot: string;   // e.g., "YOUR_AD_SLOT_ID"
  adFormat?: string;
  responsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
  layoutKey?: string; // Optional: for data-ad-layout-key
  showAdLabel?: boolean; // New prop to control visibility of "Advertisement" label
}

export const AdSenseUnit: React.FC<AdSenseUnitProps> = ({
  adClient,
  adSlot,
  adFormat = "auto",
  responsive = true,
  className,
  style = { display: 'block' }, // Removed textAlign: 'center' for the main div
  layoutKey,
  showAdLabel = true, // Default to true
}) => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error("AdSense push error:", e);
      }
    }
  }, [adClient, adSlot, adFormat, layoutKey]); // Re-run if these key props change

  const isDevelopmentPlaceholder = process.env.NODE_ENV === 'development' && (!adClient || !adSlot);

  if (isDevelopmentPlaceholder) {
    return (
      <div 
        className={className} 
        style={{
          ...style, 
          minHeight: '100px', 
          border: '2px dashed #ccc', 
          padding: '10px', 
          margin: '10px 0',
          backgroundColor: '#f0f0f0',
          color: '#555',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          fontSize: '0.8rem',
        }}
      >
        <p style={{ fontWeight: 'bold', marginBottom: '4px' }}>Ad Placeholder</p>
        <p>Ad Client: {adClient || 'MISSING'}</p>
        <p>Ad Slot: {adSlot || 'MISSING'}</p>
        <p style={{marginTop: '4px', fontStyle: 'italic'}}>(This message is visible in development mode)</p>
      </div>
    );
  }
  
  // If props are missing in production, don't render anything
  if (!adClient || !adSlot) {
    return null;
  }

  return (
    <div className={className} style={{ ...style, textAlign: 'center' }}>
      {showAdLabel && (
        <p className="text-xs text-muted-foreground mb-1 font-sans">
          Advertisement
        </p>
      )}
      <ins
        className="adsbygoogle"
        style={{ display: 'block', margin: '0 auto' }} // Ensure ad itself is centered
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={responsive ? "true" : "false"}
        data-ad-layout-key={layoutKey} // Add layout key if provided
      />
    </div>
  );
};

