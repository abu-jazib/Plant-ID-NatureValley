"use client";

import React, { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

interface AdSenseUnitProps {
  adClient: string;
  adSlot: string;
  adFormat?: string;
  responsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
  showAdLabel?: boolean;
}

export const AdSenseUnit: React.FC<AdSenseUnitProps> = ({
  adClient,
  adSlot,
  adFormat = "auto",
  responsive = true,
  className,
  style = { display: "block" },
  showAdLabel = true,
}) => {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    try {
      if (window.adsbygoogle && adRef.current) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, []);

  if (!adClient || !adSlot) return null;

  return (
    <div className={className} style={{ ...style, textAlign: "center" }}>
      {showAdLabel && (
        <p className="text-xs text-muted-foreground mb-1 font-sans">
          Advertisement
        </p>
      )}
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block", margin: "0 auto" }}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
};
