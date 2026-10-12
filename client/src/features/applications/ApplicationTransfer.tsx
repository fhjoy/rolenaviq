import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Preview {
  total: number;
  importable: number;
  duplicates: number[];
  errors: { row: number; message: string }[];
}

const base = import.meta.env.VITE_API_URL;

async function csvRequest(path: string, csv: string) {
  const response = await fetch(`${base}${path}`, { method: "POST", credentials: "include", headers: { "Content-Type": "text/csv" }, body: csv });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message ?? "Could not read the CSV");
  return result;
}

function readCsv(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Could not read this file"));
    reader.readAsText(file);
  });
}

export function ApplicationTransfer() {
  const queryClient = useQueryClient();
  const [csv, setCsv] = useState("");
  const [filename, setFilename] = useState("");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function choose(file?: File) {
    setPreview(null); setCsv(""); setError(""); setMessage(""); setFilename(file?.name ?? "");
    if (!file) return;
    if (file.size > 1_000_000) { setError("Choose a CSV smaller than 1 MB."); return; }
    try {
      setBusy(true);
      const contents = await readCsv(file);
      const result = await csvRequest("/applications/import/preview", contents);
      setCsv(contents); setPreview(result);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not preview CSV"); }
    finally { setBusy(false); }
  }

  async function confirm() {
    try {
      setBusy(true); setError("");
      const result = await csvRequest("/applications/import", csv);
      setMessage(`Imported ${result.imported} applications. Skipped ${result.duplicates.length} duplicates.`);
      setPreview(null); setCsv(""); setFilename("");
      await Promise.all([queryClient.invalidateQueries({ queryKey: ["applications"] }), queryClient.invalidateQueries({ queryKey: ["dashboard"] }), queryClient.invalidateQueries({ queryKey: ["actions"] })]);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Import failed"); }
    finally { setBusy(false); }
  }

  async function download() {
    try {
      setBusy(true); setError("");
      const response = await fetch(`${base}/applications/export`, { credentials: "include" });
      if (!response.ok) throw new Error("Could not export applications");
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a"); link.href = url; link.download = "rolenaviq-applications.csv";
      link.click(); setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Export failed"); }
    finally { setBusy(false); }
  }

  return <section aria-labelledby="transfer-heading" className="workspace-feature-panel mt-6 rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
    <h2 id="transfer-heading" className="font-semibold">Your application data</h2>
    <p className="mt-1 text-sm text-muted-foreground">Export applications and their follow-up actions as CSV. Import the same format here. Interview Prep notes and sessions are not included.</p>
    <div className="mt-4 flex flex-wrap items-end gap-4">
      <Button variant="outline" type="button" disabled={busy} onClick={() => void download()}><Download className="size-4" aria-hidden="true" /> Export CSV</Button>
      <div className="max-w-full space-y-2"><Label htmlFor="applications-csv">Import CSV</Label><Input id="applications-csv" type="file" accept=".csv,text/csv" className="max-w-full min-h-11 pt-2" onChange={event => { const file = event.target.files?.[0]; event.target.value = ""; void choose(file); }} /></div>
    </div>
    {busy && <p className="mt-3 text-sm" role="status">Working on {filename || "export"}...</p>}
    {error && <p className="mt-3 text-sm text-destructive" role="alert">{error}</p>}
    {message && <p className="mt-3 text-sm" role="status">{message}</p>}
    {preview && <div className="mt-4 rounded-xl border p-4" aria-live="polite">
      <p className="font-medium">Preview: {preview.importable} ready to import, {preview.duplicates.length} duplicates, {preview.errors.length} invalid rows (of {preview.total}).</p>
      {preview.errors.length > 0 && <ul className="mt-2 list-inside list-disc text-sm text-destructive">{preview.errors.map(item => <li key={item.row}>Row {item.row}: {item.message}</li>)}</ul>}
      {preview.duplicates.length > 0 && <p className="mt-2 text-sm">Duplicate rows skipped: {preview.duplicates.join(", ")}</p>}
      <Button className="mt-4" type="button" disabled={busy || preview.errors.length > 0 || preview.importable === 0} onClick={() => void confirm()}><Upload className="size-4" aria-hidden="true" /> Import {preview.importable} applications</Button>
    </div>}
  </section>;
}
