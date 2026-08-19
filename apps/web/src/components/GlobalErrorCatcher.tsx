'use client';

import { useEffect } from 'react';
import { setupGlobalErrorHandlers } from '../lib/logger.client';

export function GlobalErrorCatcher() {
  useEffect(() => {
    setupGlobalErrorHandlers();
  }, []);

  return null;
}
