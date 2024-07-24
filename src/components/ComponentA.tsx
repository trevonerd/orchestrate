import { useEffect } from 'react';
import { useOrchestRate } from '../utils/OrchestRate';

export function ComponentA() {
  const { orchestrate, isPerforming } = useOrchestRate();

  useEffect(() => {
    orchestrate(
      'effectA',
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        console.log('Effect A executed');
        return 'Result A';
      },
      {
        priority: 6,
      }
    );
  }, [orchestrate]);

  return (
    <>
      <div>Component A</div>
      <pre>Status: {isPerforming ? 'running' : 'idle'}</pre>
    </>
  );
}
