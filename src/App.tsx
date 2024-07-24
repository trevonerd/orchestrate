import './App.css';

import { OrchestRateProvider } from './utils/OrchestRate';
import { ComponentA } from './components/ComponentA';
import { ComponentB } from './components/ComponentB';
import { ComponentC } from './components/ComponentC';
import { ComponentD } from './components/ComponentD';

function App() {
  return (
    <OrchestRateProvider debug={true}>
      <ComponentA />
      <ComponentB />
      <ComponentC />
      <ComponentD />
      <div style={{ height: '2000px' }}>
        <p>Extra content for scrolling</p>
      </div>
    </OrchestRateProvider>
  );
}

export default App;
