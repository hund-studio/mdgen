const fromDirectoryHandle = async (directoryHandle: FileSystemDirectoryHandle) => {
  const config: BrowserConfig = {
    brand: null,
    style: null,
    locales: [],
    defaultLocale: null,
  };

  for await (const handle of directoryHandle.values()) {
    if (handle.kind !== "directory") continue;
    if (handle.name !== ".mdgen") continue;

    const handleValues = handle.values();

    for await (const handle of handleValues) {
      switch (handle.name) {
        case "config.json": {
          if (handle.kind !== "file") break;
          try {
            const parsed = JSON.parse(await (await handle.getFile()).text());
            if (Array.isArray(parsed.locales)) {
              config.locales = parsed.locales.filter((l: unknown) => typeof l === "string");
            }
            if (typeof parsed.defaultLocale === "string") {
              config.defaultLocale = parsed.defaultLocale;
            }
          } catch (error) {
            console.error("Invalid .mdgen/config.json:", error);
          }
          break;
        }
        case "style.css": {
          if (handle.kind !== "file") break;
          const file = await handle.getFile();
          config.style = await file.text();
          break;
        }
        case "logo.svg":
        case "logo.png":
        case "brand.svg":
        case "brand.png": {
          if (handle.kind !== "file") break;
          config.brand = {
            name: handle.name,
            file: await handle.getFile(),
          };
          break;
        }
      }
    }
  }

  return config;
};

export default fromDirectoryHandle;
