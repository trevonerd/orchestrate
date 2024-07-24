# OrchestRate

🎼 OrchestRate: The Maestro of React Effects! 🎭

OrchestRate is a React library for orchestrating and executing effects with priorities and delays. It provides a simple way to manage complex sequences of asynchronous operations in your React applications.

## Installation

```bash
npm install orchestrate
```

or

```bash
yarn add orchestrate
```

## Features

- Orchestrate multiple effects with different priorities
- Add pre and post delays to effects
- Set timeouts for effect execution
- Cancel specific effects
- Debug mode for detailed logging

## Usage

### Basic Setup

Wrap your app or a part of it with the `OrchestRateProvider`:

```jsx
import { OrchestRateProvider } from 'orchestrate';

function App() {
  return (
    <OrchestRateProvider>
      {/* Your app components */}
    </OrchestRateProvider>
  );
}
```

### Using the Hook

Use the `useOrchestRate` hook to access the orchestration functions:

```jsx
import { useOrchestRate } from 'orchestrate';

function MyComponent() {
  const { orchestrate, execute, cancel } = useOrchestRate();

  const handleClick = () => {
    orchestrate('effect1', async () => {
      // Your effect logic here
    }, { priority: 1 });

    orchestrate('effect2', async () => {
      // Another effect
    }, { priority: 2, preDelay: 1000 });

    execute();
  };

  return <button onClick={handleClick}>Run Effects</button>;
}
```

### Using the Effect Hook

For simpler cases, you can use the `useOrchestRateEffect` hook:

```jsx
import { useOrchestRateEffect } from 'orchestrate';

function MyComponent() {
  useOrchestRateEffect('myEffect', async () => {
    // Your effect logic here
  }, { priority: 1 });

  return <div>Effect will run on mount</div>;
}
```

## API

### `OrchestRateProvider`

A context provider component that should wrap your app or the part of your app that uses OrchestRate.

Props:

- `children`: React nodes
- `debug` (optional): Boolean to enable debug logging

### `useOrchestRate`

A hook that returns an object with the following methods:

- `orchestrate(id: string, effect: Function, options?: Object)`: Adds an effect to the queue
- `execute(): Promise<Object>`: Executes all queued effects
- `cancel(id: string)`: Cancels a specific effect

### `useOrchestRateEffect`

A hook that combines `orchestrate` and `execute` for simpler use cases.

Parameters:

- `id: string`: Unique identifier for the effect
- `effect: Function`: The effect to be executed
- `options?: Object`: Additional options (priority, preDelay, postDelay, timeout)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
