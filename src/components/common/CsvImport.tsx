"use client";

import { useRef, useState } from "react";
import Papa from "papaparse";
import UIButton from "@/components/common/UIButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Mapping = Record<string, string>; // csvHeader -> fieldName
type CSVRow = Record<string, string>;
type ImportedRow = Record<string, string>;

export default function CsvImport({ fields, onComplete }: { fields: string[]; onComplete: (rows: ImportedRow[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<CSVRow[]>([]);
  const [mapping, setMapping] = useState<Mapping>({});

  const pickFile = () => inputRef.current?.click();

  const parse = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const data = result.data as CSVRow[];
        const cols = result.meta.fields ?? [];
        setHeaders(cols);
        setRows(data);
        const initial: Mapping = {};
        cols.forEach((h) => (initial[h] = fields.includes(h) ? h : ""));
        setMapping(initial);
      },
    });
  };

  const apply = () => {
    const mapped: ImportedRow[] = rows.map((r) => {
      const out: ImportedRow = {};
      for (const [csv, field] of Object.entries(mapping)) {
        if (!field) continue;
        out[field] = r[csv];
      }
      return out;
    });
    onComplete(mapped);
  };

  return (
    <div className="space-y-3">
      <input ref={inputRef} type="file" accept=".csv" onChange={(e) => { const f = e.target.files?.[0]; if (f) parse(f); }} className="hidden" />
      <UIButton variant="outline" onClick={pickFile}>Choose CSV</UIButton>
      {headers.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Map Columns</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {headers.map((h) => (
              <div key={h} className="flex items-center gap-2">
                <div className="w-48 text-sm">{h}</div>
                <select className="px-2 py-1 rounded-md border bg-background text-sm" value={mapping[h] ?? ""} onChange={(e) => setMapping((m) => ({ ...m, [h]: e.target.value }))}>
                  <option value="">Ignore</option>
                  {fields.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            ))}
            <div className="flex justify-end">
              <UIButton onClick={apply}>Import</UIButton>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}


