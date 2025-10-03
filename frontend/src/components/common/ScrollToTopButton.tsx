import React from 'react';

type ScrollToTopButtonProps = {
  onClick: () => void;
  className?: string;
};

/**
 * Reusable button for scrolling to top of a container
 */
export default function ScrollToTopButton({ onClick, className = '' }: ScrollToTopButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-6 right-6 z-10 p-3 bg-accent text-white rounded-full shadow-lg hover:bg-accent/90 transition-all duration-200 hover:scale-110 ${className}`}
      aria-label="Scroll to top"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
    </button>
  );
}
