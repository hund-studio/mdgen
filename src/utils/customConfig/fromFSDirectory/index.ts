import fs from "node:fs/promises";
import path from "node:path";
import utils from "../..";

const fromFSDirectory = async (basePath: string): Promise<[boolean, FSConfig]> => {
  let found = false;
  const config: FSConfig = {
    brand: null,
    style: null,
    locales: [],
    defaultLocale: null,
    search: true,
  };

  try {
    const entries = await fs.readdir(basePath, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory() && entry.name === ".mdgen") {
        found = true;
        const configPath = path.join(basePath, entry.name);
        const configFiles = await fs.readdir(configPath, { withFileTypes: true });

        for (const file of configFiles) {
          if (!file.isFile()) continue;

          const filePath = path.join(configPath, file.name);

          switch (file.name) {
            case "config.json": {
              try {
                const parsed = JSON.parse(await fs.readFile(filePath, "utf-8"));
                if (Array.isArray(parsed.locales)) {
                  config.locales = parsed.locales.filter((l: unknown) => typeof l === "string");
                }
                if (typeof parsed.defaultLocale === "string") {
                  config.defaultLocale = parsed.defaultLocale;
                }
                if (typeof parsed.search === "boolean") {
                  config.search = parsed.search;
                }
              } catch (error) {
                console.error(utils.cli.print.sl.red, "Invalid .mdgen/config.json:", error);
              }
              break;
            }
            case "style.css": {
              config.style = await fs.readFile(filePath, "utf-8");
              break;
            }
            case "logo.svg":
            case "logo.png":
            case "brand.svg":
            case "brand.png": {
              config.brand = {
                name: file.name,
                file: await fs.readFile(filePath),
              };
              break;
            }
          }
        }
      }
    }
  } catch (error) {
    console.error(utils.cli.print.sl.red, "Error reading directory:", error);
  }

  return [found, config];
};

export default fromFSDirectory;
