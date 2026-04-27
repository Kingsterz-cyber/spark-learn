import { useRef, useState, useEffect, useCallback, ReactNode } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedItemProps {
  children: ReactNode;
  delay?: number;
  index: number;
  onMouseEnter?: () => void;
  onClick?: () => void;
}

const AnimatedItem = ({ children, delay = 0, index, onMouseEnter, onClick }: AnimatedItemProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4, once: false });
  return (
    <motion.div
      ref={ref}
      data-index={index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      initial={{ scale: 0.85, opacity: 0, y: 12 }}
      animate={inView ? { scale: 1, opacity: 1, y: 0 } : { scale: 0.85, opacity: 0, y: 12 }}
      transition={{ duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] }}
      className="mb-3 cursor-pointer"
    >
      {children}
    </motion.div>
  );
};

interface AnimatedListProps<T> {
  items: T[];
  renderItem: (item: T, selected: boolean, index: number) => ReactNode;
  onItemSelect?: (item: T, index: number) => void;
  showGradients?: boolean;
  enableArrowNavigation?: boolean;
  className?: string;
  maxHeight?: string;
  initialSelectedIndex?: number;
}

export function AnimatedList<T>({
  items,
  renderItem,
  onItemSelect,
  showGradients = true,
  enableArrowNavigation = true,
  className = "",
  maxHeight = "400px",
  initialSelectedIndex = -1,
}: AnimatedListProps<T>) {
  const listRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(initialSelectedIndex);
  const [keyboardNav, setKeyboardNav] = useState(false);
  const [topOpacity, setTopOpacity] = useState(0);
  const [bottomOpacity, setBottomOpacity] = useState(1);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    setTopOpacity(Math.min(scrollTop / 50, 1));
    const bottomDistance = scrollHeight - (scrollTop + clientHeight);
    setBottomOpacity(scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 50, 1));
  }, []);

  useEffect(() => {
    if (!enableArrowNavigation) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setKeyboardNav(true);
        setSelectedIndex((p) => Math.min(p + 1, items.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setKeyboardNav(true);
        setSelectedIndex((p) => Math.max(p - 1, 0));
      } else if (e.key === "Enter" && selectedIndex >= 0 && selectedIndex < items.length) {
        onItemSelect?.(items[selectedIndex], selectedIndex);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [enableArrowNavigation, items, selectedIndex, onItemSelect]);

  useEffect(() => {
    if (!keyboardNav || selectedIndex < 0 || !listRef.current) return;
    const container = listRef.current;
    const item = container.querySelector(`[data-index="${selectedIndex}"]`) as HTMLElement | null;
    if (item) {
      const margin = 40;
      const top = item.offsetTop;
      const bottom = top + item.offsetHeight;
      if (top < container.scrollTop + margin) {
        container.scrollTo({ top: top - margin, behavior: "smooth" });
      } else if (bottom > container.scrollTop + container.clientHeight - margin) {
        container.scrollTo({ top: bottom - container.clientHeight + margin, behavior: "smooth" });
      }
    }
    setKeyboardNav(false);
  }, [selectedIndex, keyboardNav]);

  return (
    <div className={cn("relative w-full", className)}>
      <div
        ref={listRef}
        onScroll={handleScroll}
        className="overflow-y-auto scrollbar-thin pr-2"
        style={{ maxHeight }}
      >
        {items.map((item, index) => (
          <AnimatedItem
            key={index}
            index={index}
            delay={0.05 * index}
            onMouseEnter={() => setSelectedIndex(index)}
            onClick={() => {
              setSelectedIndex(index);
              onItemSelect?.(item, index);
            }}
          >
            {renderItem(item, selectedIndex === index, index)}
          </AnimatedItem>
        ))}
      </div>
      {showGradients && (
        <>
          <div
            className="pointer-events-none absolute top-0 left-0 right-0 h-12 transition-opacity"
            style={{
              opacity: topOpacity,
              background: "linear-gradient(to bottom, hsl(var(--background)), transparent)",
            }}
          />
          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 transition-opacity"
            style={{
              opacity: bottomOpacity,
              background: "linear-gradient(to top, hsl(var(--background)), transparent)",
            }}
          />
        </>
      )}
    </div>
  );
}

export default AnimatedList;
