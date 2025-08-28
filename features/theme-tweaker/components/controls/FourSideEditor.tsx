"use client";

import React, { useState } from "react";
import NumberUnitInput from "./NumberUnitInput";
import { Button } from "@/components/ui/button";

export interface FourSideEditorProps {
  title: string;
  values: { top: string; right: string; bottom: string; left: string };
  allowNegative?: boolean; // only for margin
  disabled?: boolean;
  onChange: (next: { top: string; right: string; bottom: string; left: string }) => void;
}

export const FourSideEditor: React.FC<FourSideEditorProps> = ({
  title,
  values,
  allowNegative,
  disabled,
  onChange,
}) => {
  const [linked, setLinked] = useState(true);

  const setAll = (val: string) => onChange({ top: val, right: val, bottom: val, left: val });

  return (
    <div className="rounded-md border p-3 bg-background">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium">{title}</div>
        <Button
          type="button"
          variant={linked ? "secondary" : "outline"}
          size="sm"
          className="h-7"
          onClick={() => setLinked(!linked)}
          disabled={disabled}
        >
          {linked ? "Linked" : "Unlinked"}
        </Button>
      </div>

      {linked ? (
        <NumberUnitInput
          value={values.top}
          onChange={(v) => setAll(v)}
          allowNegative={allowNegative}
          disabled={disabled}
        />
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <NumberUnitInput
            label="Top"
            value={values.top}
            onChange={(v) => onChange({ ...values, top: v })}
            allowNegative={allowNegative}
            disabled={disabled}
          />
          <NumberUnitInput
            label="Right"
            value={values.right}
            onChange={(v) => onChange({ ...values, right: v })}
            allowNegative={allowNegative}
            disabled={disabled}
          />
          <NumberUnitInput
            label="Bottom"
            value={values.bottom}
            onChange={(v) => onChange({ ...values, bottom: v })}
            allowNegative={allowNegative}
            disabled={disabled}
          />
          <NumberUnitInput
            label="Left"
            value={values.left}
            onChange={(v) => onChange({ ...values, left: v })}
            allowNegative={allowNegative}
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
};

export default FourSideEditor;

