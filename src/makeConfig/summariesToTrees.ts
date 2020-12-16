import yaml from "js-yaml"
import fs from "fs"
import summaryToUrlTree from "./summaryToUrlTree"

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

export default async function summariesToTrees(configs: AllConfigs) {
  Promise.all(configs.map((config) => summaryToUrlTree(config))).then((values) => {
    fs.writeFile(`./urlTree.yml`, yaml.safeDump(values), err => {
      if (err) {
        console.log(err);
      }
    });
  })
}
