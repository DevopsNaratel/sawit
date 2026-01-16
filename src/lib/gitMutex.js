import { Mutex } from 'async-mutex';

// Shared mutex instance to prevent race conditions during Git operations
export const gitMutex = new Mutex();
