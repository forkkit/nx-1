import {
  checkFilesExist,
  newProject,
  runCLI,
  runCLIAsync,
  uniq,
} from '@nrwl/e2e/utils';

describe('Detox', () => {
  beforeEach(() => newProject());

  it('should create files and run lint command', async () => {
    const appName = uniq('myapp');
    runCLI(
      `generate @nrwl/react-native:app ${appName} --e2eTestRunner=detox --linter=eslint`
    );

    checkFilesExist(`apps/${appName}-e2e/.detoxrc.json`);
    checkFilesExist(`apps/${appName}-e2e/tsconfig.json`);
    checkFilesExist(`apps/${appName}-e2e/tsconfig.e2e.json`);
    checkFilesExist(`apps/${appName}-e2e/test-setup.ts`);
    checkFilesExist(`apps/${appName}-e2e/src/app.spec.ts`);

    const testResults = await runCLIAsync(`test ${appName}`);
    expect(testResults.combinedOutput).toContain(
      'Test Suites: 2 passed, 2 total'
    );
  });
});
