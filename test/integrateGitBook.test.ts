import {logger} from '../src/integrateGitBook'

test('adds 1 + 2 to equal 3', async () => {
  await logger()
  expect(1+2).toBe(3);
});
