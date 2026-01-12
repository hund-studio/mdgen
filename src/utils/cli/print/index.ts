import chalk from "chalk";

const orange = chalk.hex("#FFA500");

const sl = {
  green: chalk.greenBright(" | "),
  orange: orange(" | "),
  yellow: chalk.bgYellowBright(" "),
  red: chalk.bgRedBright(" "),
  magenta: chalk.magentaBright(" | "),
  gray: chalk.gray(" | "),
  blue: chalk.bgBlueBright(" "),
  white: chalk.whiteBright(" "),
};

const separator = chalk.dim(chalk.gray("• •"));

export { sl, separator };
