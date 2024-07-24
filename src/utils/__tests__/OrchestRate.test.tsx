import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import React from 'react';
import {
  OrchestRateProvider,
  useOrchestRate,
  useOrchestRateEffect,
} from './orchestrate'; // Assicurati che il percorso sia corretto

describe('OrchestRate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should orchestrate and execute effects in order of priority', async () => {
    const TestComponent = () => {
      const { orchestrate, execute } = useOrchestRate();

      React.useEffect(() => {
        orchestrate('effect1', () => 'Effect 1', { priority: 1 });
        orchestrate('effect2', () => 'Effect 2', { priority: 2 });
        orchestrate('effect3', () => 'Effect 3', { priority: 3 });
        execute();
      }, []);

      return null;
    };

    const { unmount } = render(
      <OrchestRateProvider>
        <TestComponent />
      </OrchestRateProvider>
    );

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    // Verifica che gli effetti siano stati eseguiti nell'ordine corretto
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Effect 3')
    );
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Effect 2')
    );
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Effect 1')
    );

    unmount();
  });

  it('should handle pre and post delays', async () => {
    const TestComponent = () => {
      const { orchestrate, execute } = useOrchestRate();

      React.useEffect(() => {
        orchestrate('effect1', () => 'Effect 1', {
          preDelay: 1000,
          postDelay: 500,
        });
        execute();
      }, []);

      return null;
    };

    const { unmount } = render(
      <OrchestRateProvider>
        <TestComponent />
      </OrchestRateProvider>
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000); // Pre-delay
    });

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Effect 1')
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500); // Post-delay
    });

    unmount();
  });

  it('should cancel an orchestrated effect', async () => {
    const TestComponent = () => {
      const { orchestrate, execute, cancel } = useOrchestRate();

      React.useEffect(() => {
        orchestrate('effect1', () => 'Effect 1');
        orchestrate('effect2', () => 'Effect 2');
        cancel('effect1');
        execute();
      }, []);

      return null;
    };

    const { unmount } = render(
      <OrchestRateProvider>
        <TestComponent />
      </OrchestRateProvider>
    );

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(console.log).not.toHaveBeenCalledWith(
      expect.stringContaining('Effect 1')
    );
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Effect 2')
    );

    unmount();
  });

  it('should work with useOrchestRateEffect hook', async () => {
    const effect = vi.fn();

    const TestComponent = () => {
      useOrchestRateEffect('testEffect', effect);
      return null;
    };

    const { unmount } = render(
      <OrchestRateProvider>
        <TestComponent />
      </OrchestRateProvider>
    );

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(effect).toHaveBeenCalled();

    unmount();
  });
});
