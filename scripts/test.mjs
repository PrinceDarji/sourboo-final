import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
const compile = spawnSync(process.execPath, ['node_modules/typescript/bin/tsc', '-p', 'tsconfig.tests.json'], { stdio: 'inherit' });
if (compile.status !== 0) process.exit(compile.status ?? 1);
const files = readdirSync('.test-build/tests').filter(file => file.endsWith('.test.js')).map(file => `.test-build/tests/${file}`);
const run = spawnSync(process.execPath, ['--test', ...files], { stdio: 'inherit' });
process.exit(run.status ?? 1);
