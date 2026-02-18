import cn from "classnames";
import { Fragment } from "react";

type Run = {
  text: string;
  font?: "rascal" | "coolvetica" | "schoolbell";
  className?: string;
};

export function MixedFontHeading({
  runs,
  className,
}: {
  runs: Run[];
  className?: string;
}) {
  return (
    <h1 className={cn("leading-[0.92] tracking-tight", className)}>
      {runs.map((r, i) => (
        <span
          key={i}
          className={cn(
            r.font === "rascal" && "font-rascal",
            r.font === "coolvetica" && "font-coolvetica",
            r.font === "schoolbell" && "font-schoolbell",
            r.className
          )}
        >
          {r.text}
        </span>
      ))}
    </h1>
  );
}

type FontName = "rascal" | "coolvetica" | "schoolbell";
type MixMode = "alternate" | "random" | "none";

type MixedFontTextProps = {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  baseFont?: FontName;
  accentFont?: FontName;
  mode?: MixMode;
  accentEvery?: number;
  accentProbability?: number;
  accentIndices?: number[];
  forceBaseIndices?: number[];
};

function fontClass(font: FontName) {
  if (font === "rascal") return "font-rascal";
  if (font === "schoolbell") return "font-schoolbell";
  return "font-coolvetica";
}

function hashUnit(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

export function MixedFontText({
  text,
  className,
  as = "span",
  baseFont = "coolvetica",
  accentFont = "rascal",
  mode = "alternate",
  accentEvery = 3,
  accentProbability = 0.34,
  accentIndices = [],
  forceBaseIndices = [],
}: MixedFontTextProps) {
  const Component = as;
  const forcedAccent = new Set(accentIndices);
  const forcedBase = new Set(forceBaseIndices);

  return (
    <Component className={className}>
      {Array.from(text).map((char, i) => {
        if (char === " ") return <Fragment key={`${i}-space`}> </Fragment>;

        let useAccent = false;
        if (forcedAccent.has(i)) {
          useAccent = true;
        } else if (forcedBase.has(i)) {
          useAccent = false;
        } else if (mode === "alternate") {
          useAccent = i % Math.max(accentEvery, 1) === 0;
        } else if (mode === "random") {
          useAccent = hashUnit(`${text}-${i}`) < accentProbability;
        }

        return (
          <span key={`${i}-${char}`} className={useAccent ? fontClass(accentFont) : fontClass(baseFont)}>
            {char}
          </span>
        );
      })}
    </Component>
  );
}
