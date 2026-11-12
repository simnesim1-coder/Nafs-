import { defineConfig, globalIgnores } from 'eslint/config';
import next from 'eslint-config-next/core-web-vitals';
export default defineConfig([...next, globalIgnores(['.next/**','node_modules/**']), {rules:{'react-hooks/set-state-in-effect':'off','react-hooks/immutability':'off'}}]);
