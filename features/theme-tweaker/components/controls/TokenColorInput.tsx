"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UniversalColorInput } from "../common/UniversalColorInput";

export interface TokenColorInputProps {
  label?: string;
  value: string; // can be "var(--token)" or any color
  tokens?: string[]; // suggestions
  disabled?: boolean;
  defaultMode?: "token" | "advanced";
  onChange: (next: string) => void;
}

export const TokenColorInput: React.FC<TokenColorInputProps> = ({
  label,
  value,
  tokens = [],
  disabled,
  defaultMode = "token",
  onChange,
}) => {
  const [mode, setMode] = useState<"token" | "advanced">(defaultMode);
  const isToken = /^var\(--[a-z0-9-]+\)$/i.test(value.trim());
  useEffect(() => {
    if (isToken) setMode("token");
  }, [value]);

  const tokenValue = isToken ? value.replace(/^var\(|\)$/g, "").trim() : "var(--border)";

  return (
    <div>
      {label && <div className="text-xs text-muted-foreground mb-1">{label}</div>}
      <div className="flex items-center gap-2 mb-2">
        <Button type="button" size="sm" variant={mode === "token" ? "secondary" : "outline"} disabled={disabled} onClick={() => setMode("token")}>
          Token
        </Button>
        <Button type="button" size="sm" variant={mode === "advanced" ? "secondary" : "outline"} disabled={disabled} onClick={() => setMode("advanced")}>
          Advanced
        </Button>
      </div>

      {mode === "token" ? (
        <div className="flex items-center gap-2">
          <Input
            list="tt-token-suggestions"
            className="h-9 font-mono text-xs"
            placeholder="--border, --accent, …"
            disabled={disabled}
            value={isToken ? tokenValue : "var(--border)"}
            onChange={(e) => onChange(`var(${e.target.value})`)}
          />
          <datalist id="tt-token-suggestions">
            {tokens.map((t) => (
              <option value={t} key={t} />
            ))}
          </datalist>
        </div>
      ) : (
        <UniversalColorInput value={value} onChange={onChange} disabled={disabled} />
      )}
    </div>
  );
};

export default TokenColorInput;

