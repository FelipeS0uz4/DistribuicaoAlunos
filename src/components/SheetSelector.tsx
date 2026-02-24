import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FileSpreadsheet } from "lucide-react";

interface SheetSelectorProps {
  sheetNames: string[];
  selectedSheets: string[];
  onToggle: (sheetName: string) => void;
}

const SheetSelector: React.FC<SheetSelectorProps> = ({
  sheetNames,
  selectedSheets,
  onToggle,
}) => {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <FileSpreadsheet className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-bold text-foreground">Selecione as Abas</h3>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        Escolha quais abas do Excel serão utilizadas:
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {sheetNames.map((name) => (
          <label
            key={name}
            className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all hover:bg-accent/50 ${
              selectedSheets.includes(name)
                ? "border-primary bg-accent"
                : "border-border"
            }`}
          >
            <Checkbox
              checked={selectedSheets.includes(name)}
              onCheckedChange={() => onToggle(name)}
            />
            <Label className="cursor-pointer font-semibold text-sm">{name}</Label>
          </label>
        ))}
      </div>
    </div>
  );
};

export default SheetSelector;
