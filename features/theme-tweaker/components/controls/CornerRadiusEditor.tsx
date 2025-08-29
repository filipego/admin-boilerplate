"use client";

import React, { useState } from "react";
import NumberUnitInput from "./NumberUnitInput";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface CornerRadiusEditorProps {
  title?: string;
  values: { tl: string; tr: string; br: string; bl: string };
  disabled?: boolean;
  onChange: (next: { tl: string; tr: string; br: string; bl: string }) => void;
}

const PRESETS = ["0px", "4px", "8px", "12px", "16px", "24px", "9999px"]; // pill = 9999px

export const CornerRadiusEditor: React.FC<CornerRadiusEditorProps> = ({
  title = "Radius",
  values,
  disabled,
  onChange,
}) => {
  const [linked, setLinked] = useState(true);
  const setAll = (v: string) => onChange({ tl: v, tr: v, br: v, bl: v });

  return (
    <div className="rounded-md border p-3 bg-background">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium">{title}</div>
        <div className="flex items-center gap-2">
          <div className="min-w-32">
            <Select onValueChange={(v) => setAll(v)} disabled={disabled}>
              <SelectTrigger className="h-7 text-xs">
                <SelectValue placeholder="Preset" />
              </SelectTrigger>
              <SelectContent>
                {PRESETS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p === "9999px" ? "pill" : p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button size="sm" variant={linked ? "secondary" : "outline"} className="h-7" disabled={disabled} onClick={() => setLinked(!linked)}>
            {linked ? "Linked" : "Unlinked"}
          </Button>
        </div>
      </div>

      {linked ? (
        <NumberUnitInput value={values.tl} onChange={(v) => setAll(v)} disabled={disabled} />
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <NumberUnitInput label="TL" value={values.tl} onChange={(v) => onChange({ ...values, tl: v })} disabled={disabled} />
          <NumberUnitInput label="TR" value={values.tr} onChange={(v) => onChange({ ...values, tr: v })} disabled={disabled} />
          <NumberUnitInput label="BR" value={values.br} onChange={(v) => onChange({ ...values, br: v })} disabled={disabled} />
          <NumberUnitInput label="BL" value={values.bl} onChange={(v) => onChange({ ...values, bl: v })} disabled={disabled} />
        </div>
      )}
    </div>
  );
};

export default CornerRadiusEditor;
