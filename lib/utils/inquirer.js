import OldInquirer from "inquirer";
import autocomplete from "inquirer-autocomplete-prompt";
import checkboxPlus from "inquirer-checkbox-plus-prompt";

OldInquirer.registerPrompt(autocomplete);
OldInquirer.registerPrompt(checkboxPlus);

const inquirer = OldInquirer;

export default inquirer;
