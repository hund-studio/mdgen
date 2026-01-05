import { build } from "vite";
import { ChildProcess, spawn } from "child_process";
import chokidar from "chokidar";
import path from "path";
import chalk from "chalk";

const sl = {
  red: chalk.bgRedBright(" "),
  green: chalk.bgGreenBright(" "),
  orange: chalk.bgYellowBright(" "),
};

const separator = "- - - -";

function runCommand(command: string, args: string[]): ChildProcess {
  const process = spawn(command, args, { stdio: "inherit", shell: true });

  process.on("error", (err) => {
    console.error(`${sl.red} Errore nell'esecuzione di ${command}:`, err);
  });

  return process;
}

function runCli(args: string[]) {
  runCommand("node", ["./dist-cli/cli.js", ...args]);
}

async function dev() {
  console.log(`${sl.green} [cmd] dev`);
  console.log(separator);

  console.log(`${sl.orange} [build] static start`);
  await build({
    configFile: path.resolve(process.cwd(), "vite.config.static.ts"),
    logLevel: "silent",
  });
  console.log(`${sl.green} [build] static complete\n`);

  build({
    configFile: path.resolve(process.cwd(), "vite.config.static.ts"),
    build: { watch: {} },
    logLevel: "silent",
  });
  console.log(`${sl.green} [watch] static watch`);

  build({
    configFile: path.resolve(process.cwd(), "vite.config.cli.ts"),
    build: { watch: {} },
    logLevel: "silent",
  });

  // @todo continue from here
  console.log(`${sl.green} [watch] cli watch`);

  const exampleArgs = [
    "-s",
    "./examples/dnd-adventure",
    "-o",
    "./dist-md",
    "-n",
    "dnd-adventure",
    "-u",
    "/docs",
  ];

  runCli([...exampleArgs, "-w"]);
  console.log(`${sl.green} [watch] example watch`);
  console.log(`${separator}\n`);

  const staticSrcWatcher = chokidar.watch("src/static/**/*.js", {
    ignoreInitial: true,
  });

  staticSrcWatcher.on("change", () => {
    console.log(`${sl.orange} [watch] src/static regenerate`);
    // runCli(exampleArgs);
  });
}

dev().catch(console.error);
