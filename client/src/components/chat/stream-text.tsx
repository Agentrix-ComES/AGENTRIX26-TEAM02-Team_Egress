import { useEffect, useState } from "react";

interface Props {
  text: string;
  speedMs?: number;
  onDone?: () => void;
}

export function StreamText({ text, speedMs = 12, onDone }: Props) {
  const [shown, setShown] = useState("");
  useEffect(() => {
    setShown("");
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) {
        window.clearInterval(id);
        onDone?.();
      }
    }, speedMs);
    return () => window.clearInterval(id);
  }, [text, speedMs, onDone]);
  return (
    <span>
      {shown}
      {shown.length < text.length && (
        <span className="inline-block w-1.5 h-3.5 -mb-0.5 bg-current/70 animate-pulse ml-0.5" />
      )}
    </span>
  );
}
