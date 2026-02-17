import React from 'react';

export default function usePdfWorker() {
  const workerRef = React.useRef(null);

  React.useEffect(() => {
    workerRef.current = {
      post: async (fn) => fn()
    };
    return () => {
      workerRef.current = null;
    };
  }, []);

  return workerRef;
}
