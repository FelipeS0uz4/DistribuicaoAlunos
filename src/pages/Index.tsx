import { useState, useCallback } from "react";
import * as XLSX from "xlsx";
import logo from "@/assets/logo.svg";
import ExcelDropzone from "@/components/ExcelDropzone";
import SheetSelector from "@/components/SheetSelector";
import RoomConfigurator, { RoomData } from "@/components/RoomConfigurator";
import DistributionResult from "@/components/DistributionResult";
import { Button } from "@/components/ui/button";
import { CheckCircle, RotateCcw } from "lucide-react";
import {
  lerAlunosDasPlanilhas,
  misturarAlunos,
  distribuirAlunosSalas,
  SalaDistribuida,
} from "@/lib/studentDistribution";
import { toast } from "sonner";

const Index = () => {
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [fileName, setFileName] = useState("");
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheets, setSelectedSheets] = useState<string[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [rooms, setRooms] = useState<RoomData[]>([{ name: "", seats: 0 }]);
  const [result, setResult] = useState<{
    salas: SalaDistribuida[];
    totalAlunos: number;
  } | null>(null);

  const handleFileLoaded = useCallback((wb: XLSX.WorkBook, name: string) => {
    setWorkbook(wb);
    setFileName(name);
    setSheetNames(wb.SheetNames);
    setSelectedSheets([]);
    setTotalStudents(0);
    setResult(null);
  }, []);

  const toggleSheet = useCallback((name: string) => {
    setSelectedSheets((prev) => {
      const newSelected = prev.includes(name)
        ? prev.filter((s) => s !== name)
        : [...prev, name];
      
      // Update total students count
      if (workbook) {
        const alunos = lerAlunosDasPlanilhas(workbook, newSelected);
        setTotalStudents(alunos.length);
      }
      
      return newSelected;
    });
  }, [workbook]);

  const handleSubmit = () => {
    if (!workbook) return;

    // Read students from selected sheets
    const alunos = lerAlunosDasPlanilhas(workbook, selectedSheets);

    if (alunos.length === 0) {
      toast.error("Nenhum aluno encontrado nas abas selecionadas.");
      return;
    }

    const validRooms = rooms.filter((r) => r.name && r.seats > 0);
    if (validRooms.length === 0) {
      toast.error("Configure pelo menos uma sala com nome e assentos.");
      return;
    }

    // Mix and distribute
    const alunosMisturados = misturarAlunos(alunos);
    const salasDistribuidas = distribuirAlunosSalas(
      alunosMisturados,
      validRooms.map((r) => ({ numero: r.name, qtdLugares: r.seats }))
    );

    setResult({ salas: salasDistribuidas, totalAlunos: alunos.length });
    toast.success(`${alunos.length} alunos distribuídos em ${validRooms.length} sala(s)!`);
  };

  const handleReset = () => {
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <img src={logo} alt="Rede Decisão" className="h-10" />
          <span className="rounded-full bg-accent px-4 py-1.5 text-xs font-bold text-accent-foreground">
            Gestão de Salas
          </span>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-4xl px-6 py-10">
        {/* Title */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {result ? "Distribuição de Alunos" : "Importar Planilha"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {result
              ? "Confira a alocação dos alunos nas salas"
              : "Envie seu arquivo Excel e configure as salas para distribuição"}
          </p>
        </div>

        {result ? (
          <>
            <DistributionResult salas={result.salas} totalAlunos={result.totalAlunos} />
            <Button
              variant="outline"
              size="lg"
              className="mt-4 w-full text-base font-bold"
              onClick={handleReset}
            >
              <RotateCcw className="mr-2 h-5 w-5" />
              Nova Distribuição
            </Button>
          </>
        ) : (
          <>
            {/* Step 1 */}
            <section className="mb-8">
              <StepLabel step={1} label="Envie o arquivo Excel" />
              <ExcelDropzone onFileLoaded={handleFileLoaded} />
            </section>

            {/* Step 2 */}
            {workbook && sheetNames.length > 0 && (
              <section className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <StepLabel step={2} label="Selecione as abas" />
                <SheetSelector
                  sheetNames={sheetNames}
                  selectedSheets={selectedSheets}
                  onToggle={toggleSheet}
                />
              </section>
            )}

            {/* Step 3 */}
            {workbook && (
              <section className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <StepLabel step={3} label="Configure as salas" />
                <RoomConfigurator 
                  rooms={rooms} 
                  onRoomsChange={setRooms}
                  totalStudents={totalStudents}
                />
              </section>
            )}

            {/* Submit */}
            {workbook && selectedSheets.length > 0 && rooms.some((r) => r.name) && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Button
                  size="lg"
                  className="w-full text-base font-bold"
                  onClick={handleSubmit}
                >
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Distribuir Alunos
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

const StepLabel = ({ step, label }: { step: number; label: string }) => (
  <div className="mb-3 flex items-center gap-3">
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
      {step}
    </span>
    <h2 className="text-base font-bold text-foreground">{label}</h2>
  </div>
);

export default Index;
