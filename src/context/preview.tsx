import {
  createContext,
  useState,
  type Dispatch,
  type FC,
  type PropsWithChildren,
  type SetStateAction,
} from "react";

export const previewContext = createContext<
  | {
      db?: SearchDB;
      current: string;
      setCurrent: Dispatch<SetStateAction<string>>;
      tree: BrowserDirectoryEntry;
      config?: BrowserConfig;
    }
  | undefined
>(undefined);

const PreviewProvider: FC<
  PropsWithChildren<{ db?: SearchDB; tree: BrowserDirectoryEntry; config?: BrowserConfig }>
> = ({ children, tree, db, config }) => {
  const [current, setCurrent] = useState("/");
  return (
    <previewContext.Provider value={{ db, tree, current, setCurrent, config }}>
      {children}
    </previewContext.Provider>
  );
};

export default PreviewProvider;
