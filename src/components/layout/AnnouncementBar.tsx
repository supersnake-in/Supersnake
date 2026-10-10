'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, X } from 'lucide-react';
import { useStore } from '@/lib/store';
import { isAnnouncementActive, isValidAnnouncementUrl } from '@/lib/types';

export function AnnouncementBar({
  className,
  onDismiss,
}: {
  className?: string;
  onDismiss?: () => void;
}) {
  const pathname = usePathname();
  const { announcementConfig } = useStore();

  // Hide on admin routes, maintenance holding screen, or if announcement is not active
  const isStorefront = !pathname.startsWith('/admin') && !pathname.startsWith('/maintenance');
  const isVisible = isStorefront && isAnnouncementActive(announcementConfig);

  if (!isVisible || !announcementConfig) {
    return null;
  }

  const {
    message,
    destinationUrl,
    ctaLabel,
    bgColor = '#111111',
    textColor = '#EDEDED',
    accentColor = '#04fc21',
  } = announcementConfig;

  const hasValidUrl = isValidAnnouncementUrl(destinationUrl);
  const isExternalUrl = hasValidUrl && destinationUrl?.startsWith('https://');
  const hasCta = hasValidUrl && Boolean(ctaLabel?.trim());

  return (
    <aside
      role="region"
      aria-label="Announcement"
      style={{
        backgroundColor: bgColor,
        color: textColor,
      }}
      className={`w-full h-9 flex items-center justify-center transition-colors duration-300 shrink-0 relative ${className || ''}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full h-full flex items-center justify-center relative">
        {/* Centered Message Area */}
        <div className="flex-1 flex items-center justify-center text-center px-7 sm:px-10">
          {hasValidUrl && !hasCta ? (
            // Entire message clickable when destination is configured without explicit CTA label
            <Link
              href={destinationUrl!}
              target={isExternalUrl ? '_blank' : undefined}
              rel={isExternalUrl ? 'noopener noreferrer' : undefined}
              className="group inline-flex items-center justify-center gap-2 text-center text-[10px] sm:text-[11px] md:text-xs font-mono uppercase tracking-[0.16em] sm:tracking-[0.2em] font-medium transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 rounded-sm px-1"
            >
              <span className="truncate max-w-[68vw] sm:max-w-none">{message}</span>
              <ArrowRight
                size={11}
                style={{ color: accentColor || undefined }}
                className="shrink-0 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          ) : hasValidUrl && hasCta ? (
            // Message with subtle distinct call-to-action button
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-[10px] sm:text-[11px] md:text-xs font-mono uppercase tracking-[0.16em] sm:tracking-[0.2em] font-medium">
              <span className="truncate max-w-[60vw] sm:max-w-none">{message}</span>
              <Link
                href={destinationUrl!}
                target={isExternalUrl ? '_blank' : undefined}
                rel={isExternalUrl ? 'noopener noreferrer' : undefined}
                style={{
                  color: accentColor || undefined,
                }}
                className="group inline-flex items-center gap-1 font-bold underline-offset-4 hover:underline shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 rounded-sm px-1"
              >
                <span>{ctaLabel}</span>
                <ArrowRight
                  size={11}
                  className="shrink-0 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </div>
          ) : (
            // Non-clickable announcement text (no fake CTA rendered)
            <div className="text-center text-[10px] sm:text-[11px] md:text-xs font-mono uppercase tracking-[0.16em] sm:tracking-[0.2em] font-medium truncate max-w-[70vw] sm:max-w-none">
              {message}
            </div>
          )}
        </div>

        {/* Close Mark / Dismiss Button */}
        {onDismiss && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDismiss();
            }}
            aria-label="Close announcement"
            className="absolute right-2 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 p-1 sm:p-1.5 rounded-full text-current opacity-60 hover:opacity-100 hover:bg-white/10 active:scale-90 transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 shrink-0 cursor-pointer"
          >
            <X size={13} className="sm:w-3.5 sm:h-3.5" strokeWidth={2.2} />
          </button>
        )}
      </div>
    </aside>
  );
}
