/**
 * @jest-environment node
 */

import {allUrlRoutes} from "../src/tree"

test('rofl', async () => {
  let lol = await allUrlRoutes(
    ['https://raw.githubusercontent.com/Open-EdTech/AWS-CSA/main/urlTree.yml']
  );
  console.log(lol)
  expect(1+2).toBe(3)
})