import { build } from "vite";
import { ChildProcess, spawn } from "child_process";
import chokidar from "chokidar";
import path from "path";

function runCommand(command: string, args: string[]): ChildProcess {
  const process = spawn(command, args, { stdio: "inherit", shell: true });

  process.on("error", (err) => {
    console.error(`❌ Errore nell'esecuzione di ${command}:`, err);
  });

  return process;
}

function runCli(args: string[]) {
  runCommand("node", [
    "./dist-cli/cli.js",
    "-s",
    "./examples/dnd-adventure",
    "-o",
    "./dist-md",
    "-n",
    "dnd-adventure",
    "-w",
  ]);
}

async function dev() {
  console.log("🛠️  Inizializzazione ambiente di sviluppo...");

  console.log("👀 Avvio Watcher: Static Assets");
  await build({
    configFile: path.resolve(process.cwd(), "vite.config.static.ts"),
    build: { watch: {} },
  });

  console.log("👀 Avvio Watcher: CLI");
  await build({
    configFile: path.resolve(process.cwd(), "vite.config.cli.ts"),
    build: { watch: {} },
  });

  const exampleArgs = ["-s", "./examples/dnd-adventure", "-o", "./dist-md", "-n", "dnd-adventure"];

  console.log("📖 Avvio Pipeline Documentazione...");
  runCli([...exampleArgs, "-w"]);

  const staticSrcWatcher = chokidar.watch("src/static/**/*.js", {
    ignoreInitial: true,
  });

  staticSrcWatcher.on("change", () => {
    console.log("✨ Modifica rilevata in src/static. Rigenero esempio...");

    runCli(exampleArgs);
  });
}

dev().catch(console.error);
