/** Signals whether to run the end-to-end integration tests */
export const serverRunning = true

/* Dummy test to shut jest up about needing a test per file */
describe('Dummy test', () => it('returns true', () => new Promise(r => r(true))))

