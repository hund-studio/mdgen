declare class FileSystemObserver {
  constructor(callback: (records: any[], observer: FileSystemObserver) => void);
  observe(target: any, options?: any): Promise<void>;
  disconnect(): void;
}
