
"use client";

import React, { useEffect, useRef } from 'react';

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

// This Set will track ad slots for which .push() has been called in the current session.
// It's defined outside the component to persist across re-renders of AdSenseUnit instances.
const adSlotsInitializedThisSession = new Set<string>();

export const AdSenseUnit: React.FC<AdSenseUnitProps> = ({
  adClient,
  adSlot,
  adFormat = "auto",
  responsive = true,
  className,
  style = { display: 'block' },
  layoutKey,
  showAdLabel = true,
}) => {
  const insRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    const adElement = insRef.current;

    // Ensure the ad element is in the DOM and AdSense script is available
    if (!adElement || typeof window.adsbygoogle === 'undefined') {
      return;
    }

    // Check 1: See if AdSense has already marked this specific <ins> element as filled or done.
    // This is the most direct indicator from AdSense itself.
    const adSenseTagStatus = adElement.getAttribute('data-ad-status');
    if (adSenseTagStatus === 'filled' || adSenseTagStatus === 'done') {
      adSlotsInitializedThisSession.add(adSlot); // Ensure our session tracker knows
      return;
    }

    // Check 2: See if our session tracker already knows we've tried to push this slot.
    // This helps prevent re-pushes if the component re-renders or Strict Mode calls useEffect twice
    // before AdSense updates data-ad-status.
    if (adSlotsInitializedThisSession.has(adSlot)) {
      return;
    }

    // If neither of the above, attempt to initialize the ad.
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      // Mark this slot as having had .push() called for it in this session.
      adSlotsInitializedThisSession.add(adSlot);
    } catch (e: any) {
      console.error(`AdSense push error for slot ${adSlot}:`, e);
      // If the specific error is that all ins elements are already processed,
      // then AdSense believes it's done. We should mark our slot as initialized
      // to prevent our code from retrying in this session.
      if (e && e.message && e.message.includes("All 'ins' elements in the DOM with class=adsbygoogle already have ads in them")) {
        adSlotsInitializedThisSession.add(adSlot);
      }
    }
  }, [adClient, adSlot, adFormat, responsive, layoutKey]); // Dependencies for the effect

  const isDevelopmentPlaceholder = process.env.NODE_ENV === 'development' && (!adClient || !adSlot || adClient.includes("YOUR_PUBLISHER_ID") || adSlot.includes("YOUR_AD_SLOT_ID"));

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
        <p>Ad Client: {adClient.includes("YOUR_PUBLISHER_ID") ? "MISSING (Please update in code)" : adClient}</p>
        <p>Ad Slot: {adSlot.includes("YOUR_AD_SLOT_ID") ? "MISSING (Please update in code)" : adSlot}</p>
        <p style={{marginTop: '4px', fontStyle: 'italic'}}>(This message is visible in development mode or if placeholders are used)</p>
      </div>
    );
  }
  
  if (!adClient || !adSlot || adClient.includes("YOUR_PUBLISHER_ID") || adSlot.includes("YOUR_AD_SLOT_ID")) {
    if (process.env.NODE_ENV === 'production') {
        console.warn(`AdSenseUnit: adClient or adSlot is using placeholder values in production for slot: ${adSlot}. Ad will not be rendered.`);
        return null; 
    }
  }

  return (
    <div className={className} style={{ ...style, textAlign: 'center' }}>
      {showAdLabel && (
        <p className="text-xs text-muted-foreground mb-1 font-sans">
          Advertisement
        </p>
      )}
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: 'block', margin: '0 auto' }}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={responsive ? "true" : "false"}
        data-ad-layout-key={layoutKey}
      />
    </div>
  );
};
