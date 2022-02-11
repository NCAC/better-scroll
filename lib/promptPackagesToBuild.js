import inquirer from "inquirer";
import checkboxPlus from "inquirer-checkbox-plus-prompt";

inquirer.registerPrompt(checkboxPlus);

export default function promptPackagesToBuild(allPackages) {
  let choices = allPackages.unshift("all");
  let choosenPackages;

  return new Promise((resolve, reject) => {
    inquirer
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
          choices: choices.map((name) => ({
            value: name,
            name
          }))
        }
      ])
      .then((answer) => {
        choosenPackages = answer.packages;
        return inquirer.prompt([
          {
            name: "yes",
            message: `Confirm build ${answer.packages.join(" and ")} packages?`,
            type: "list",
            choices: ["Y", "N"]
          }
        ]);
      })
      .then((answer) => {
        if ("Y" === answer.yes) {
          resolve(choosenPackages);
        } else {
          console.log(chalk.yellow("[release] cancelled."));
          reject(false);
        }
      });
  });
}
