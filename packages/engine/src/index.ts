/**
 * The Allora II simulation engine. It runs in a Web Worker (see worker.ts) and
 * owns all game state and rules. The UI imports only types and the protocol.
 */
export const ENGINE_NAME = 'allora-ii-engine';
export const ENGINE_VERSION = '0.0.0';

export * from './calendar';
export * from './engine';
export * from './events';
export * from './host';
export * from './protocol';
export * from './rng';
export * from './state';
export * from './travel';
export * from './world';
export * from './save/migrations';
export * from './save/store';
