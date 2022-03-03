import config from "./config.js";
import getPackagesName from "./getPackagesName.js";
import path from "path";

export default function initConfig() {
  return new Promise((resolve, reject) => {
    config.bootstrap();
    getPackagesName()
      .catch(reject)
      .then((packageNames) => {
        const configPackages = {};
        const packagePath = config.get("packagesPath");
        packageNames.forEach((packageName) => {
          const distPath = path.join(packagePath, packageName, "dist");
          configPackages[packageName] = {
            distPath: distPath,
            typePath: path.join(distPath, "types")
          };
        });
        config.set("packages", configPackages);
        resolve();
      });
  });
}
