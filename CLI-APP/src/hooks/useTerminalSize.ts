import { useState, useEffect } from 'react';

interface TerminalSize {
  columns: number;
  rows: number;
}

export const useTerminalSize = (): TerminalSize => {
  const [size, setSize] = useState<TerminalSize>({
    columns: process.stdout.columns || 80,
    rows: process.stdout.rows || 24,
  });

  useEffect(() => {
    const updateSize = () => {
      setSize({
        columns: process.stdout.columns || 80,
        rows: process.stdout.rows || 24,
      });
    };

    // Listen for terminal resize events
    process.stdout.on('resize', updateSize);

    return () => {
      process.stdout.off('resize', updateSize);
    };
  }, []);

  return size;
};
