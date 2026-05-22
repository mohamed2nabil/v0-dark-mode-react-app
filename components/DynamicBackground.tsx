"use client";

import React, { useEffect } from "react";

interface DynamicBackgroundProps {
  children: React.ReactNode;
}

// Permanent dark background with stronger overlay while the user moves the mouse.
export function DynamicBackground({ children }: DynamicBackgroundProps) {
  useEffect(() => {
    const removeBadges = (root: ParentNode = document) => {
      try {
        const candidates = Array.from(root.querySelectorAll('*')) as HTMLElement[];
        candidates.forEach((el) => {
          const comp = window.getComputedStyle(el);
          if (comp.position === 'fixed') {
            const rect = el.getBoundingClientRect();
            const small = rect.width <= 56 && rect.height <= 56;
            const nearLeft = rect.left >= 0 && rect.left < 140;
            const nearBottom = (window.innerHeight - rect.bottom) >= 0 && (window.innerHeight - rect.bottom) < 140;
            const text = (el.textContent || '').trim();
            if (small && nearLeft && nearBottom && text.length <= 2) {
              el.remove();
            }
          }
        });
      } catch (e) {}
    };

    removeBadges(document);

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.addedNodes && m.addedNodes.length) {
          m.addedNodes.forEach((n) => {
            if (n instanceof HTMLElement) removeBadges(n);
            else if (n instanceof DocumentFragment) removeBadges(n);
          });
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  const overlayStyle = {
    background: "linear-gradient(to bottom, rgba(5, 5, 5, 0.25), rgba(5, 5, 5, 0.5), rgba(10, 10, 10, 0.75))",
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Dark Background (fixed and dimmed) */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/dark.jpeg')`,
          filter: 'brightness(0.75) saturate(1.05) contrast(1.05)',
          transition: 'filter 300ms ease-in-out',
        }}
      />

      {/* Strong persistent overlay */}
      <div
        className="fixed inset-0 pointer-events-none backdrop-blur-[3px] shadow-[inset_0_0_120px_rgba(0,0,0,0.8)]"
        style={overlayStyle}
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen">
        {children}
      </div>
    </div>
  );
}
