'use client';

import { useEffect } from 'react';

export default function AutoPrint() {
  useEffect(() => {
    // Wait slightly for fonts/styles to load before triggering print
    const timer = setTimeout(() => {
      window.print();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return null;
}
