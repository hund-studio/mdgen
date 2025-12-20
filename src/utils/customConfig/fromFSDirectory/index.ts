import fs from "node:fs/promises";
import path from "node:path";

const fromFSDirectory = async (basePath: string) => {
  const config: {
    brand: null | { file: Buffer; name: string };
    style: null | string;
  } = {
    brand: null,
    style: null,
  };

  try {
    const entries = await fs.readdir(basePath, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory() && entry.name === ".mdgen") {
        const configPath = path.join(basePath, entry.name);
        const configFiles = await fs.readdir(configPath, { withFileTypes: true });

        for (const file of configFiles) {
          if (!file.isFile()) continue;

          const filePath = path.join(configPath, file.name);

          switch (file.name) {
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
    console.error("Error reading directory:", error);
  }

  return config;
};

export default fromFSDirectory;
