import {defineConfig} from 'vitest/config';
import {fileURLToPath} from 'node:url';
export default defineConfig({test:{maxWorkers:1,testTimeout:120000,hookTimeout:180000},resolve:{alias:{'server-only':fileURLToPath(new URL('./tests/server-only-stub.ts',import.meta.url)),'@':fileURLToPath(new URL('.',import.meta.url))}}});
