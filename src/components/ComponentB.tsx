import { useEffect, useState } from 'react';
import { useOrchestRate } from '../utils/OrchestRate';

export function ComponentB() {
  const { orchestrate, execute } = useOrchestRate();
  const [result, setResult] = useState('');

  useEffect(() => {
    orchestrate(
      'effectB',
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 2500));
        console.log('Effect B executed');
        return 'Result B';
      },
      {
        priority: 3,
      }
    );
  }, [orchestrate]);

  const handleStartQueue = async () => {
    const results = await execute();
    setResult(JSON.stringify(results, null, 2));
  };

  return (
    <div>
      <button onClick={handleStartQueue}>Start Queue</button>
      <pre>{result}</pre>
    </div>
  );
}
