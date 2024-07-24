import { useEffect } from 'react';
import { useOrchestRate } from '../utils/OrchestRate';

export function ComponentD() {
  const { orchestrate } = useOrchestRate();

  useEffect(() => {
    orchestrate(
      'effectD',
      () => {
        console.log('Effect D executed (scroll)');
        window.scrollTo({
          top: 500,
          behavior: 'smooth',
        });
        return 'Scrolled 500px';
      },
      {
        priority: 2,
        preDelay: 3000,
        postDelay: 4000,
      }
    );
  }, [orchestrate]);

  return <div>Component D (Scroll, Priority: 2)</div>;
}
