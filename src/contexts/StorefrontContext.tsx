import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_CONTENT,
  type StorefrontContent,
} from "@/data/storefrontContent";
const Context = createContext({ content: DEFAULT_CONTENT, loading: true });
export function StorefrontProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<StorefrontContent>(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    fetch("/api/storefront")
      .then((r) => (r.ok ? r.json() : null))
      .then((value) => {
        if (
          active &&
          value &&
          Array.isArray(value.banners) &&
          Array.isArray(value.collections) &&
          value.intervalMs >= 5000 &&
          value.intervalMs <= 7000
        )
          setContent(value);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  return (
    <Context.Provider value={{ content, loading }}>{children}</Context.Provider>
  );
}
export function useStorefrontContent() {
  return useContext(Context).content;
}
export function useStorefrontLoading() {
  return useContext(Context).loading;
}
