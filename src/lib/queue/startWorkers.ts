#!/usr/bin/env node
/**
 * Worker Process Entry Point
 *
 * This script starts all BullMQ workers as a separate Node.js process.
 * Run this alongside your Next.js application:
 *
 *   npm run workers
 *
 * Or in development:
 *   tsx src/lib/queue/startWorkers.ts
 */

import { startAllWorkers, stopAllWorkers } from './workers';

async function main() {
  console.log('========================================');
  console.log('  Stock Analysis App - Worker Process  ');
  console.log('========================================\n');

  try {
    // Start all workers
    await startAllWorkers();

    console.log('\n✓ Worker process ready');
    console.log('  Press Ctrl+C to stop\n');

    // Handle graceful shutdown
    const shutdown = async (signal: string) => {
      console.log(`\n${signal} received, shutting down gracefully...`);

      try {
        await stopAllWorkers();
        console.log('✓ Shutdown complete');
        process.exit(0);
      } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Keep process alive
    process.stdin.resume();

  } catch (error) {
    console.error('Failed to start workers:', error);
    process.exit(1);
  }
}

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start workers
main();
