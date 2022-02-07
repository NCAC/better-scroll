import fileSystem from "fs-extra";
import { reject } from "lodash";
import { resolve, join } from "path";
import config from "./config.js";

export default function getPackagesName() {
  const rootPath = config.get("rootPath");
  return fileSystem
    .readdir(join(rootPath, "packages"))
    .catch((err) => {
      reject(err);
    })
    .then((packages) => {
      const result = packages
        .filter((name) => {
          const isHiddenFile = /^\./g.test(name);
          return !isHiddenFile;
        })
        .filter((name) => {
          const isPrivatePackages = require(resolve(
            `packages/${name}/package.json`
          )).private;
          return !isPrivatePackages;
        });
      resolve(result);
    });
}
