import { build } from "vite";
import { ChildProcess, spawn } from "child_process";
import * as cli from "../src/utils/cli";
import chokidar from "chokidar";
import path from "path";
import treeKill from "tree-kill";

let cliProcess: ChildProcess | null = null;

function runCommand(command: string, args: string[]): ChildProcess {
  const process = spawn(command, args, { stdio: "inherit" });

  process.on("error", (err) => {
    console.error(
      `${cli.print.sl.blue}${cli.print.sl.red} Errore nell'esecuzione di ${command}:`,
      err
    );
  });

  return process;
}

function runCli(args: string[]) {
  return runCommand("node", ["./dist-cli/cli.js", ...args]);
}

const buildEssentials = async () => {
  console.log(`${cli.print.sl.blue}${cli.print.sl.orange} [build] Building static templates...`);
  await build({
    configFile: path.resolve(process.cwd(), "vite.config.static.ts"),
    logLevel: "silent",
  });
  console.log(`${cli.print.sl.blue}${cli.print.sl.green} [build] Static build complete.`);
  console.log(`${cli.print.sl.blue}${cli.print.sl.orange} [build] Building CLI...`);
  await build({
    configFile: path.resolve(process.cwd(), "vite.config.cli.ts"),
    logLevel: "silent",
  });
  console.log(`${cli.print.sl.blue}${cli.print.sl.green} [build] CLI build complete.`);
};

async function dev() {
  console.log(`${cli.print.separator}`);
  console.log(`${cli.print.sl.blue}${cli.print.sl.magenta} [cmd] Running dev command...`);
  console.log(`${cli.print.separator}`);
  await buildEssentials();

  const exampleArgs = ["-s", "./examples/docs", "-o", "./dist-md", "-n", "docs", "-u", "/docs"];

  console.log(`${cli.print.sl.blue}${cli.print.sl.magenta} [watch] Watching source files...`);

  cliProcess = runCli([...exampleArgs, "-w"]);

  chokidar
    .watch([path.resolve(process.cwd(), "src"), path.resolve(process.cwd(), "templates")], {
      ignored: (path) => path.includes("/src/static/"),
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 1000,
        pollInterval: 1000,
      },
    })
    .on("all", async () => {
      if (cliProcess) {
        if (!cliProcess.pid) throw "Invalid PID";
        treeKill(cliProcess.pid, "SIGKILL");
      }
      await buildEssentials();
      const now = new Date();
      const formatted = now.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      console.log(
        `${cli.print.sl.blue}${cli.print.sl.magenta} [watch] ${formatted} Restarting source files watch...`
      );

      cliProcess = runCli([...exampleArgs, "-w"]);
    });
}

dev().catch(console.error);
