import inquirer from "inquirer";
import checkboxPlus from "inquirer-checkbox-plus-prompt";
import { resolve } from "jest-config/build/utils";
import { reject } from "lodash";
inquirer.registerPrompt(checkboxPlus);

export default function promptPackagesToBuild(allPackages) {
  return inquirer
    .prompt([
      {
        type: "checkboxPlus",
        name: "packages",
        scroll: false,
        message: "Select build repo(Support Multiple selection)",
        validate(answer) {
          if (answer.length > 1) {
            return `
      It seems that you did't make a choice.

      Please try it again.
    `;
          }
        },
        choices: allPackages.map((name) => ({
          value: name,
          name
        }))
      }
    ])
    .then((answer) => {
      const packages = answer.packages.unshift("all");
      return inquirer.prompt([
        {
          name: "yes",
          message: `Confirm build ${packages.join(" and ")} packages?`,
          type: "list",
          choices: ["Y", "N"]
        }
      ]);
    })
    .then((answer) => {
      if ("Y" === answer.yes) {
        resolve(true);
      } else {
        console.log(chalk.yellow("[release] cancelled."));
        reject(false);
      }
    });
}
