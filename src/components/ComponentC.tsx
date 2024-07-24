import { useEffect } from 'react';
import { useOrchestRate } from '../utils/OrchestRate';

export function ComponentC() {
  const { orchestrate } = useOrchestRate();

  useEffect(() => {
    orchestrate(
      'effectC',
      () => {
        console.log('Effect C executed (sync)');
        return 'Result C';
      },
      {
        priority: 4,
      }
    );
  }, [orchestrate]);

  return <div>Component C (Sync)</div>;
}
