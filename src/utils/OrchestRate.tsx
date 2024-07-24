/**
 * @fileoverview OrchestRate - A React library for orchestrating and executing effects with priorities and delays.
 * @author Marco Trevisani <marco.trevisani81@gmail.com>
 * @version 1.0.0
 */

import React, {
  createContext,
  useContext,
  useRef,
  useCallback,
  useState,
} from 'react';

/** Function that returns a Promise or any value */
type EffectFunction = () => Promise<any> | any;

/** Represents an item in the orchestration queue */
interface OrchestrationItem {
  id: string;
  effect: EffectFunction;
  priority: number;
  preDelay?: number;
  postDelay?: number;
  timeout?: number;
}

/** Context type for OrchestRate */
interface OrchestRateContextType {
  /**
   * Adds an effect to the orchestration queue
   * @param {string} id - Unique identifier for the effect
   * @param {EffectFunction} effect - Function to be executed
   * @param {Object} [options] - Additional options for the effect
   * @param {number} [options.priority] - Priority of the effect (higher number = higher priority)
   * @param {number} [options.preDelay] - Delay in ms before executing the effect
   * @param {number} [options.postDelay] - Delay in ms after executing the effect
   * @param {number} [options.timeout] - Timeout in ms for the effect execution
   */
  orchestrate: (
    id: string,
    effect: EffectFunction,
    options?: {
      priority?: number;
      preDelay?: number;
      postDelay?: number;
      timeout?: number;
    }
  ) => void;

  /**
   * Executes all orchestrated effects
   * @returns {Promise<Object>} - Object containing results of all executed effects
   */
  execute: () => Promise<{ [key: string]: any }>;

  /**
   * Cancels a specific orchestrated effect
   * @param {string} id - Identifier of the effect to cancel
   */
  cancel: (id: string) => void;

  /**
   * A boolean flag indicating whether the orchestration queue is currently being executed
   */
  isPerforming: boolean;
}

const OrchestRateContext = createContext<OrchestRateContextType | undefined>(
  undefined
);

/**
 * Creates an orchestrator instance
 * @param {boolean} [debug=false] - Enables debug logging when true
 * @returns {Object} - Orchestrator methods
 */
const createOrchestrator = (debug: boolean = false) => {
  const queue = new Set<OrchestrationItem>();
  let isPerforming = false;
  let executionQueue: (() => Promise<{ [key: string]: any }>)[] = [];

  const log = (category: string, message: string) => {
    if (debug) console.log(`[🎼OrchestRate] ${category} ${message}`);
  };

  const orchestrate = (
    id: string,
    effect: EffectFunction,
    options: {
      priority?: number;
      preDelay?: number;
      postDelay?: number;
      timeout?: number;
    } = {}
  ) => {
    const { priority = 0, preDelay = 0, postDelay = 0, timeout } = options;
    const item: OrchestrationItem = {
      id,
      effect,
      priority,
      preDelay,
      postDelay,
      timeout,
    };
    queue.delete([...queue].find((i) => i.id === id) || item);
    queue.add(item);
    log('[➕ ADD]', `Orchestrated: ${id} with priority ${priority}`);
  };

  const cancel = (id: string) => {
    const item = [...queue].find((i) => i.id === id);
    if (item) {
      queue.delete(item);
      log('[🚫 CANCEL]', `Cancelled: ${id}`);
    }
  };

  const execute = async (): Promise<{ [key: string]: any }> => {
    if (isPerforming) {
      log('[⏳ QUEUE]', 'Queueing execution request');
      return new Promise<{ [key: string]: any }>((resolve) => {
        executionQueue.push(async () => {
          const result = await execute();
          resolve(result);
          return result;
        });
      });
    }

    if (queue.size === 0) {
      log('[ℹ️ INFO]', 'Execution attempted on empty queue');
      return {};
    }

    isPerforming = true;
    const results: { [key: string]: any } = {};
    const sortedQueue = [...queue].sort((a, b) => b.priority - a.priority);

    log(
      '[▶️ EXEC]',
      `Orchestration order: ${sortedQueue
        .map((item) => `${item.id} (priority: ${item.priority})`)
        .join(', ')}`
    );

    for (const item of sortedQueue) {
      log('[🚀 INIT]', `Starting performance: ${item.id}`);
      const startTime = performance.now();

      if (item.preDelay) {
        log('[🕒 DELAY]', `Pre-delay of ${item.preDelay}ms for ${item.id}`);
        await new Promise((resolve) => setTimeout(resolve, item.preDelay));
      }

      try {
        const effectResult = await Promise.resolve(item.effect());
        results[item.id] = effectResult;
        log('[✅ DONE]', `Completed: ${item.id}`);
      } catch (error) {
        log(
          '[❌ ERROR]',
          `Error in ${item.id}: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
        results[item.id] = {
          error: error instanceof Error ? error.message : String(error),
        };
      }

      if (item.postDelay) {
        log('[🕒 DELAY]', `Post-delay of ${item.postDelay}ms for ${item.id}`);
        await new Promise((resolve) => setTimeout(resolve, item.postDelay));
      }

      const endTime = performance.now();
      log('[📊 PERF]', `${item.id} took ${(endTime - startTime).toFixed(2)}ms`);
    }

    queue.clear();
    isPerforming = false;
    log('[✅ DONE]', 'Orchestration completed');

    if (executionQueue.length > 0) {
      const nextExecution = executionQueue.shift();
      if (nextExecution) {
        return nextExecution();
      }
    }

    return results;
  };

  return {
    orchestrate,
    execute,
    cancel,
    get isPerforming() {
      return isPerforming;
    },
  };
};

/**
 * Provider component for OrchestRate
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {boolean} [props.debug=false] - Enables debug logging when true
 */
export const OrchestRateProvider: React.FC<{
  children: React.ReactNode;
  debug?: boolean;
}> = ({ children, debug = false }) => {
  const orchestratorRef = useRef(createOrchestrator(debug));
  const [isPerforming, setIsPerforming] = useState(false);

  const contextValue: OrchestRateContextType = {
    orchestrate: useCallback(
      (
        id: string,
        effect: EffectFunction,
        options?: {
          priority?: number;
          preDelay?: number;
          postDelay?: number;
          timeout?: number;
        }
      ) => orchestratorRef.current.orchestrate(id, effect, options),
      []
    ),
    execute: useCallback(async () => {
      setIsPerforming(true);
      const result = await orchestratorRef.current.execute();
      setIsPerforming(false);
      return result;
    }, []),
    cancel: useCallback((id: string) => orchestratorRef.current.cancel(id), []),
    isPerforming,
  };

  return (
    <OrchestRateContext.Provider value={contextValue}>
      {children}
    </OrchestRateContext.Provider>
  );
};

/**
 * Hook to access OrchestRate context
 * @returns {OrchestRateContextType} - OrchestRate context value
 * @throws {Error} If used outside of OrchestRateProvider
 */
export const useOrchestRate = () => {
  const context = useContext(OrchestRateContext);
  if (context === undefined) {
    throw new Error(
      'useOrchestRate must be used within an OrchestRateProvider'
    );
  }
  return context;
};

/**
 * Hook to orchestrate and execute an effect
 * @param {string} id - Unique identifier for the effect
 * @param {EffectFunction} effect - Function to be executed
 * @param {Object} [options] - Additional options for the effect
 * @param {number} [options.priority] - Priority of the effect (higher number = higher priority)
 * @param {number} [options.preDelay] - Delay in ms before executing the effect
 * @param {number} [options.postDelay] - Delay in ms after executing the effect
 * @param {number} [options.timeout] - Timeout in ms for the effect execution
 */
export const useOrchestRateEffect = (
  id: string,
  effect: EffectFunction,
  options?: {
    priority?: number;
    preDelay?: number;
    postDelay?: number;
    timeout?: number;
  }
) => {
  const { orchestrate, execute } = useOrchestRate();

  React.useEffect(() => {
    orchestrate(id, effect, options);
    execute().catch(console.error);
  }, [id, effect, options, orchestrate, execute]);
};
