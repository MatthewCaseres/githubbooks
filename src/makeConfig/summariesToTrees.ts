import fs from 'fs';
import summaryToUrlTree from './summaryToUrlTree';

export type Config = {
  url: string,
  localPath?: string,
  removeHeadings?: string
}
export type AllConfigs = Config[];

export default async function summariesToTrees(
  configs: AllConfigs,
  rawProvider = 'https://raw.githubusercontent.com'
) {
  Promise.all(
    configs.map(config => summaryToUrlTree(config, rawProvider))
  ).then(values => {
    fs.writeFile(`./bookConfig.json`, JSON.stringify(values), err => {
      if (err) {
        console.log(err);
      }
    });
  });
}
