import inquirer from "inquirer";
import config from "./config.js";
// const
export default function promptPackagesToBuild(allPackages) {
  allPackages.unshift("all");
  console.log("promptPackagesToBuild(), allPackages = ", allPackages);
  let choosenPackages;
  const choices = allPackages.map((name) => {
    return {
      value: name,
      name
    };
  });
  console.log("choices: ", choices);

  return new Promise((resolve, reject) => {
    inquirer
      .prompt([
        {
          type: "checkbox",
          name: "packages",
          choices: choices,
          loop: false,
          message: "Select build repo(Support Multiple selection)",
          validate(answer) {
            if (answer.length < 1) {
              return `
      It seems that you did't make a choice.

      Please try it again.
    `;
            }
            return true;
          }
        }
      ])
      .then((answer) => {
        console.log(answer);
        let message = "";
        if (answer.packages.indexOf("all" > -1)) {
          console.log("yes, all is inside");
          console.log("packages from config = ", config.get("packages"));
          message += "Confirm build all packages ?";
          choosenPackages = config.get("packages");
        } else {
          message += `Confirm build ${choosenPackages.join(" and ")} packages?`;
          choosenPackages = answer.packages;
        }

        return inquirer.prompt([
          {
            name: "yes",
            message: message,
            type: "confirm"
          }
        ]);
      })
      .then((answer) => {
        if (answer.yes) {
          resolve(choosenPackages);
        } else {
          console.log(chalk.yellow("[release] cancelled."));
          reject(false);
        }
      });
  });
}
