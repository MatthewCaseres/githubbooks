import fs from 'fs';
import summaryToUrlTree from './summaryToUrlTree';

type LocalConfig = {
  local: true;
  localPath: string;
  url?: string;
  removeHeadings?: boolean;
};
type RemoteConfig = {
  localPath?: string;
  url: string;
  removeHeadings?: boolean;
};
export type Config = LocalConfig | RemoteConfig;
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
