declare class FileSystemObserver {
  constructor(callback: (records: any[], observer: FileSystemObserver) => void);
  observe(target: any, options?: any): Promise<void>;
  disconnect(): void;
}

/** mdgen package version, injected at build time (see vite.config.tool.ts). */
declare const __MDGEN_VERSION__: string;
