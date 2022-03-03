import fileSystem from "fs-extra";
import { join } from "path";
import config from "./config.js";

export default function getPackagesName() {
  const packagesPath = config.get("packagesPath");
  return new Promise((resolve, reject) => {
    return fileSystem
      .readdir(packagesPath)
      .catch((err) => {
        reject(err);
      })
      .then((packages) => {
        let promises = [];
        packages.forEach((packageName) => {
          if (/^\./g.test(packageName)) {
            return;
          }
          promises.push(
            new Promise((resolve, reject) => {
              console.log(join(packagesPath, packageName, "package.json"));

              fileSystem
                .readJSON(join(packagesPath, packageName, "package.json"))
                .catch(reject)
                .then((pkg) => {
                  if (pkg.private) {
                    resolve(false);
                  } else {
                    console.log("resolved : ", packageName);
                    resolve(packageName);
                  }
                });
            })
          );
        });
        return Promise.all(promises);
      })
      .then((validatedPackages) => {
        // console.log(validatedPackages);
        // const packagesToBuild = [];
        // validatedPackages.forEach((validatedPackage) => {
        //   if (validatedPackage) {
        //     packagesToBuild.push(validatedPackage);
        //   }
        // });
        // console.log("packagesToBuild = ", packagesToBuild);
        // // resolve(packagesToBuild);
        resolve(
          validatedPackages.filter((validatedPackage) => {
            return !!validatedPackage;
          })
        );
      });
  });
}
