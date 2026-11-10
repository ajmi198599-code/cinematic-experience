import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const proposal = fileURLToPath(new URL('../docs/proposed-ignore-root-preview.sh', import.meta.url));

test('the proposed root filter fails open and skips only scoped showroom previews', () => {
  const root = mkdtempSync(join(tmpdir(), 'br-root-policy-'));
  const git = (...args) => {
    const result = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
  };
  const decision = (environment = 'preview', branch = 'feature/beyond-reality-showroom-sprint-03-1') => spawnSync('sh', [proposal], {
    cwd: root,
    env: { ...process.env, VERCEL_ENV: environment, VERCEL_GIT_COMMIT_REF: branch },
  }).status;
  const commitFile = (path, text) => {
    writeFileSync(join(root, path), text);
    git('add', '.');
    git('commit', '-qm', 'Test build scope');
  };
  try {
    git('init', '-q');
    git('config', 'user.name', 'Build policy test');
    git('config', 'user.email', 'test@example.invalid');
    mkdirSync(join(root, 'experiences/beyond-reality-technology-showroom'), { recursive: true });
    mkdirSync(join(root, 'experiences/beyond-reality-phase-a'), { recursive: true });
    commitFile('root-app.js', 'Root app');
    assert.equal(decision(), 1, 'missing parent must build');
    commitFile('experiences/beyond-reality-technology-showroom/scene.js', 'Showroom');
    assert.equal(decision(), 0);
    assert.equal(decision('production'), 1);
    assert.equal(decision('preview', 'main'), 1);
    assert.equal(decision('', ''), 1);
    assert.equal(decision('preview', 'feature/unrelated'), 1);
    commitFile('experiences/beyond-reality-phase-a/data.json', '{}');
    assert.equal(decision(), 0);
    commitFile('root-app.js', 'Changed root app');
    assert.equal(decision(), 1, 'root changes on a showroom branch must build');
    commitFile('experiences/beyond-reality-phase-a/scene.js', 'Other app');
    assert.equal(decision(), 1, 'the exception is limited to shared data');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
