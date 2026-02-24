import React, { useCallback, useState } from "react";
import * as XLSX from "xlsx";
import { Upload, FileSpreadsheet, CheckCircle } from "lucide-react";

interface ExcelDropzoneProps {
  onFileLoaded: (workbook: XLSX.WorkBook, fileName: string) => void;
}

const ExcelDropzone: React.FC<ExcelDropzoneProps> = ({ onFileLoaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const processFile = useCallback(
    (file: File) => {
      setIsLoading(true);
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        onFileLoaded(workbook, file.name);
        setIsLoading(false);
      };
      reader.readAsArrayBuffer(file);
    },
    [onFileLoaded]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`
        relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 transition-all duration-300 cursor-pointer
        ${isDragging
          ? "border-primary bg-dropzone-hover scale-[1.02] shadow-lg"
          : fileName
            ? "border-success bg-accent/30"
            : "border-muted-foreground/30 bg-dropzone hover:border-primary hover:bg-dropzone-hover"
        }
      `}
      onClick={() => document.getElementById("excel-input")?.click()}
    >
      <input
        id="excel-input"
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={handleFileInput}
      />

      {isLoading ? (
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary" />
          <p className="text-sm font-semibold text-muted-foreground">Carregando arquivo...</p>
        </div>
      ) : fileName ? (
        <div className="flex flex-col items-center gap-3">
          <CheckCircle className="h-12 w-12 text-success" />
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            <p className="text-sm font-bold text-foreground">{fileName}</p>
          </div>
          <p className="text-xs text-muted-foreground">Clique ou arraste para trocar o arquivo</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-base font-bold text-foreground">
              Arraste seu arquivo Excel aqui
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              ou clique para selecionar (.xlsx, .xls, .csv)
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExcelDropzone;
