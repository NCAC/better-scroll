import fileSystem from "fs-extra";
import path from "path";
import initConfig from "./initConfig.js";
// const rollup = require("rollup");
// const chalk = require("chalk");
// const zlib = require("zlib");
// const rimraf = require("rimraf");
// const typescript = require("rollup-plugin-typescript2");
// const uglify = require("rollup-plugin-uglify").uglify;
// const execa = require("execa");
// const ora = require("ora");
// const spinner = ora({
//   prefixText: `${chalk.green("\n[building tasks]")}`
// });

import promptPackagesToBuild from "./promptPackagesToBuild.js";
import getPackagesName from "./getPackagesName.js";
import config from "./config.js";

function cleanPackagesOldDist(packagesName) {
  packagesName.forEach((name) => {
    const distPath = resolve(`packages/${name}/dist`);
    const typePath = resolve(`packages/${name}/dist/types`);

    if (fileSystem.existsSync(distPath)) {
      rimraf.sync(distPath);
    }

    fileSystem.mkdirSync(distPath);
    fileSystem.mkdirSync(typePath);
  });
}

function resolve(p) {
  return path.resolve(__dirname, "../", p);
}

function PascalCase(str) {
  const re = /-(\w)/g;
  const newStr = str.replace(re, function (match, group1) {
    return group1.toUpperCase();
  });
  return newStr.charAt(0).toUpperCase() + newStr.slice(1);
}

const generateBanner = (packageName) => {
  let ret =
    "/*!\n" +
    " * better-scroll / " +
    packageName +
    "\n" +
    " * (c) 2016-" +
    new Date().getFullYear() +
    " ustbhuangyi\n" +
    " * Released under the MIT License.\n" +
    " */";
  return ret;
};

const buildType = [
  {
    format: "umd",
    ext: ".js"
  },
  {
    format: "umd",
    ext: ".min.js"
  },
  {
    format: "es",
    ext: ".esm.js"
  }
];

function generateBuildConfigs(packagesName) {
  const result = [];
  packagesName.forEach((name) => {
    buildType.forEach((type) => {
      let config = {
        input: resolve(`packages/${name}/src/index.ts`),
        output: {
          file: resolve(`packages/${name}/dist/${name}${type.ext}`),
          name: PascalCase(name),
          format: type.format,
          banner: generateBanner(name)
        },
        plugins: generateBuildPluginsConfigs(type.ext.indexOf("min") > -1, name)
      };
      // rename
      if (name === "core" && config.output.format !== "es") {
        config.output.name = "BScroll";
        /** Disable warning for default imports */
        config.output.exports = "named";
        // it seems the umd bundle can not satisfies our demand
        config.output.footer =
          'if(typeof window !== "undefined" && window.BScroll) { \n' +
          "  window.BScroll = window.BScroll.default;\n}";
      }
      // rollup will valiate config properties of config own and output a warning.
      // put packageName in prototype to ignore warning.
      Object.defineProperties(config, {
        packageName: {
          value: name
        },
        ext: {
          value: type.ext
        }
      });
      result.push(config);
    });
  });
  return result;
}
function generateBuildPluginsConfigs(isMin) {
  const tsConfig = {
    verbosity: -1,
    tsconfig: path.resolve(__dirname, "../tsconfig.json")
  };
  const plugins = [];
  if (isMin) {
    plugins.push(uglify());
  }
  plugins.push(typescript(tsConfig));
  return plugins;
}

function build(builds) {
  let built = 0;
  const total = builds.length;
  const next = () => {
    buildEntry(builds[built], built + 1, () => {
      builds[built - 1] = null;
      built++;
      if (built < total) {
        next();
      }
    });
  };
  next();
}

function buildEntry(config, curIndex, next) {
  const isProd = /min\.js$/.test(config.output.file);

  spinner.start(`${config.packageName}${config.ext} is buiding now. \n`);

  rollup
    .rollup(config)
    .then((bundle) => {
      bundle.write(config.output).then(({ output }) => {
        const code = output[0].code;

        spinner.succeed(
          `${config.packageName}${config.ext} building has ended.`
        );

        function report(extra) {
          console.log(
            chalk.magenta(path.relative(process.cwd(), config.output.file)) +
              " " +
              getSize(code) +
              (extra || "")
          );
          next();
        }
        if (isProd) {
          zlib.gzip(code, (err, zipped) => {
            if (err) return reject(err);
            let words = `(gzipped: ${chalk.magenta(getSize(zipped))})`;
            report(words);
          });
        } else {
          report();
        }

        // since we need bundle code for three types
        // just generate .d.ts only once
        if (curIndex % 3 === 0) {
          copyDTSFiles(config.packageName);
        }
      });
    })
    .catch((e) => {
      spinner.fail("buiding is failed");
      console.log(e);
    });
}

function copyDTSFiles(packageName) {
  console.log(
    chalk.cyan("> start copying .d.ts file to dist dir of packages own.")
  );
  const sourceDir = resolve(
    `packages/${packageName}/dist/packages/${packageName}/src/*`
  );
  const targetDir = resolve(`packages/${packageName}/dist/types/`);
  execa.commandSync(`mv ${sourceDir} ${targetDir}`, { shell: true });
  console.log(chalk.cyan("> copy job is done."));
  rimraf.sync(resolve(`packages/${packageName}/dist/packages`));
  rimraf.sync(resolve(`packages/${packageName}/dist/node_modules`));
}

function getSize(code) {
  return (code.length / 1024).toFixed(2) + "kb";
}

function buildBootstrap() {
  return new Promise((resolve, reject) => {
    initConfig()
      .then(() => {
        const packages = config.get("packages");
        return promptPackagesToBuild(packages);
      })
      .then((choosenPackages) => {
        console.log("choosenPackages: ", choosenPackages);
        let promises = [];
        if (!choosenPackages) {
          reject();
        } else {
          choosenPackages.forEach((packageName) => {
            promises.push(
              new Promise((resolve, reject) => {
                // clean old dist and dist/types directories
              })
            );
          });
        }
      });
  });
}

// const buildBootstrap = async () => {
//   // const packagesName = getPackagesName();
//   // // provide 'all' option
//   // packagesName.unshift("all");

//   getPackagesName()
//     .then((packages) => {
//       return promptPackagesToBuild(packages);
//     })
//     .then((chosenPackages) => {
//       if (!chosenPackages) {
//         return;
//       }
//     });

//   // getAnswersFromInquirer(packagesName).then((answer) => {});

//   const answers = await getAnswersFromInquirer(packagesName);

//   if (!answers) return;

//   cleanPackagesOldDist(answers);

//   const buildConfigs = generateBuildConfigs(answers);

//   build(buildConfigs);
// };

// function getPackagesName() {
//   let ret;
//   let all = fileSystem.readdirSync(resolve("packages"));
//   // drop hidden file whose name is startWidth '.'
//   // drop packages which would not be published(eg: examples and docs)
//   ret = all
//     .filter((name) => {
//       const isHiddenFile = /^\./g.test(name);
//       return !isHiddenFile;
//     })
//     .filter((name) => {
//       const isPrivatePackages = require(resolve(
//         `packages/${name}/package.json`
//       )).private;
//       return !isPrivatePackages;
//     });

//   return ret;
// }

//#region RUN
buildBootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
//#endregion