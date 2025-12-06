import {
  createContext,
  useState,
  type Dispatch,
  type FC,
  type PropsWithChildren,
  type SetStateAction,
} from "react";
import type { DirectoryTree } from "../App";

export const previewContext = createContext<
  | {
      current: string;
      setCurrent: Dispatch<SetStateAction<string>>;
      tree: DirectoryTree;
    }
  | undefined
>(undefined);

const PreviewProvider: FC<PropsWithChildren<{ tree: DirectoryTree }>> = ({ children, tree }) => {
  const [current, setCurrent] = useState("/");
  return (
    <previewContext.Provider value={{ tree, current, setCurrent }}>
      {children}
    </previewContext.Provider>
  );
};

export default PreviewProvider;
