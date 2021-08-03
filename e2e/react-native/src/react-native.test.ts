import {
  checkFilesExist,
  newProject,
  readJson,
  runCLI,
  runCLIAsync,
  uniq,
  updateFile,
} from '@nrwl/e2e/utils';
import { join } from 'path';

describe('react native', () => {
  let proj: string;

  beforeEach(() => (proj = newProject()));

  it('create ios and android JS bundles', async () => {
    const appName = uniq('my-app');
    const libName = uniq('lib');
    const componentName = uniq('component');

    runCLI(`generate @nrwl/react-native:application ${appName}`);
    runCLI(`generate @nrwl/react-native:library ${libName}`);
    runCLI(
      `generate @nrwl/react-native:component ${componentName} --project=${libName}`
    );

    const appTestResults = await runCLIAsync(`test ${appName}`);
    expect(appTestResults.combinedOutput).toContain(
      'Test Suites: 1 passed, 1 total'
    );

    const libTestResults = await runCLIAsync(`test ${appName}`);
    expect(libTestResults.combinedOutput).toContain(
      'Test Suites: 1 passed, 1 total'
    );

    const iosBundleResult = await runCLIAsync(`bundle-ios ${appName}`);
    expect(iosBundleResult).toContain('Done writing bundle output');
    expect(() =>
      checkFilesExist(`dist/apps/${appName}/ios/main.bundle`)
    ).not.toThrow();

    const androidBundleResult = await runCLIAsync(`bundle-android ${appName}`);
    expect(androidBundleResult).toContain('Done writing bundle output');
    expect(() =>
      checkFilesExist(`dist/apps/${appName}/android/main.bundle`)
    ).not.toThrow();
  });

  it('sync npm dependencies for autolink', async () => {
    const appName = uniq('my-app');
    runCLI(`generate @nrwl/react-native:application ${appName}`);
    // Add npm package with native modules
    updateFile(join('package.json'), (content) => {
      const json = JSON.parse(content);
      json.dependencies['react-native-image-picker'] = '1.0.0';
      json.dependencies['react-native-gesture-handler'] = '1.0.0';
      json.dependencies['react-native-safe-area-contex'] = '1.0.0';
      return JSON.stringify(json, null, 2);
    });
    // Add import for Nx to pick up
    updateFile(join('apps', appName, 'src/app/App.tsx'), (content) => {
      return `import { launchImageLibrary } from 'react-native-image-picker';\n${content}`;
    });

    await runCLIAsync(
      `sync-deps ${appName} --include=react-native-gesture-handler,react-native-safe-area-context`
    );

    const result = readJson(join('apps', appName, 'package.json'));
    expect(result).toMatchObject({
      dependencies: {
        'react-native-image-picker': '*',
        'react-native-gesture-handler': '*',
        'react-native-safe-area-context': '*',
      },
    });
  });
});
