import { build } from "vite";
import * as esbuild from "esbuild";
import path from "path";
import ts from "typescript";

async function runBuilds() {
  try {
    console.log("📦 Controllo tipi in corso...");

    const configPath = ts.findConfigFile("./", ts.sys.fileExists, "tsconfig.json");
    if (!configPath) throw new Error("File tsconfig.json non trovato.");

    const configFile = ts.readConfigFile(configPath, ts.sys.readFile);

    const parsedConfig = ts.parseJsonConfigFileContent(
      configFile.config,
      ts.sys,
      path.dirname(configPath)
    );

    const program = ts.createProgram(parsedConfig.fileNames, parsedConfig.options);
    const emitResult = program.emit();

    const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

    if (allDiagnostics.length > 0) {
      allDiagnostics.forEach((diagnostic) => {
        if (diagnostic.file) {
          const { line, character } = ts.getLineAndCharacterOfPosition(
            diagnostic.file,
            diagnostic.start!
          );
          const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
          console.error(
            `❌ ${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`
          );
        } else {
          console.error(`❌ ${ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")}`);
        }
      });

      if (emitResult.emitSkipped) {
        console.error("💥 Type check fallito. Interrompo la build.");
        process.exit(1);
      }
    }

    const configs = ["vite.config.static.ts", "vite.config.tool.ts", "vite.config.cli.ts"];

    for (const configFile of configs) {
      console.log(`🔨 Build con ${configFile}...`);
      await build({
        configFile: path.resolve(process.cwd(), configFile),
      });
    }

    // Runtime helper shipped alongside the CLI; aliased as "mdgen" when
    // bundling the doc's components (react stays external/shared).
    console.log("🔨 Build runtime helper (dist-cli/runtime.mjs)...");
    await esbuild.build({
      entryPoints: [path.resolve(process.cwd(), "src/runtime/index.ts")],
      outfile: path.resolve(process.cwd(), "dist-cli/runtime.mjs"),
      bundle: true,
      format: "esm",
      platform: "neutral",
      external: ["react", "react-dom"],
    });

    console.log("✅ Tutte le build completate!");
  } catch (error) {
    console.error("💥 Errore fatale:", error);
    process.exit(1);
  }
}

runBuilds();
