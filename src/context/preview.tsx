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
      tree: DirectoryTree;
    }
  | undefined
>(undefined);

const PreviewProvider: FC<PropsWithChildren<{ db?: SearchDB; tree: DirectoryTree }>> = ({
  children,
  tree,
  db,
}) => {
  const [current, setCurrent] = useState("/");
  return (
    <previewContext.Provider value={{ db, tree, current, setCurrent }}>
      {children}
    </previewContext.Provider>
  );
};

export default PreviewProvider;
