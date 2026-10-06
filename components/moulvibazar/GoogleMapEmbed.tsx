'use client';

import React, { useState } from 'react';
import { MapPin, Navigation, ExternalLink, Phone } from 'lucide-react';
import { business } from '@/lib/business';

export default function GoogleMapEmbed() {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Header bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-50 text-red-600 border border-red-100 shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
              Showroom Location & Navigation
            </h3>
            <p className="text-xs text-slate-500">
              {business.address}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={business.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-[#2A3B97] hover:bg-[#212F7A] text-white text-xs font-bold py-2 px-3.5 rounded-xl transition shadow-xs"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Open in Google Maps</span>
          </a>
        </div>
      </div>

      {/* Map iframe container */}
      <div className="relative w-full h-[320px] sm:h-[400px] bg-slate-100">
        {!isLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 text-slate-400 text-xs">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
            <span>Loading Google Maps Moulvibazar...</span>
          </div>
        )}
        <iframe
          title="Trust Computer Moulvibazar Location on Google Maps"
          src={business.googleMapsEmbedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={false}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          onLoad={() => setIsLoaded(true)}
          className="w-full h-full"
        />
      </div>

      {/* Footer navigation guidance */}
      <div className="p-4 sm:p-5 bg-white border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
        <div className="flex items-start gap-2">
          <span className="font-bold text-slate-900">Landmark:</span>
          <span>Opposite Kusumbagh Point, T.S Plaza 2nd Floor</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="font-bold text-slate-900">From Bus Stand:</span>
          <span>5-7 mins by Rickshaw / Tomtom from Chandnighat</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="font-bold text-slate-900">Assistance:</span>
          <a href={business.sales.tel} className="text-blue-600 font-bold hover:underline">
            Call {business.sales.phone}
          </a>
        </div>
      </div>
    </div>
  );
}
