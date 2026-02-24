import React from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Download, Users, DoorOpen, Shuffle } from "lucide-react";
import { SalaDistribuida, criarExcelDistribuicao } from "@/lib/studentDistribution";

interface DistributionResultProps {
  salas: SalaDistribuida[];
  totalAlunos: number;
}

const DistributionResult: React.FC<DistributionResultProps> = ({ salas, totalAlunos }) => {
  const alunosAlocados = salas.reduce((sum, s) => sum + s.alunos.length, 0);
  const alunosNaoAlocados = totalAlunos - alunosAlocados;

  const handleExport = () => {
    const wb = criarExcelDistribuicao(salas);
    XLSX.writeFile(wb, "Distribuicao_Alunos.xlsx");
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card p-4 text-center shadow-sm">
          <Users className="mx-auto mb-1 h-6 w-6 text-primary" />
          <p className="text-2xl font-extrabold text-foreground">{totalAlunos}</p>
          <p className="text-xs text-muted-foreground">Total de alunos</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center shadow-sm">
          <DoorOpen className="mx-auto mb-1 h-6 w-6 text-primary" />
          <p className="text-2xl font-extrabold text-foreground">{salas.length}</p>
          <p className="text-xs text-muted-foreground">Salas</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center shadow-sm">
          <Shuffle className="mx-auto mb-1 h-6 w-6 text-primary" />
          <p className="text-2xl font-extrabold text-foreground">{alunosAlocados}</p>
          <p className="text-xs text-muted-foreground">Alocados</p>
        </div>
      </div>

      {alunosNaoAlocados > 0 && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-center text-sm font-semibold text-destructive">
          ⚠️ {alunosNaoAlocados} aluno(s) não foram alocados por falta de vagas.
        </div>
      )}

      {/* Rooms */}
      {salas.map((sala) => (
        <div key={sala.numero} className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="flex items-center justify-between bg-primary/10 px-5 py-3">
            <h3 className="font-bold text-foreground">
              Sala {sala.numero}
            </h3>
            <span className="text-xs font-semibold text-muted-foreground">
              {sala.alunos.length}/{sala.qtdLugares} lugares
            </span>
          </div>
          <div className="divide-y">
            {sala.alunos.map((aluno, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-2 text-sm">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                  {i + 1}
                </span>
                <span className="flex-1 font-medium text-foreground">{aluno.nome}</span>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                  {aluno.turma}
                </span>
              </div>
            ))}
            {sala.alunos.length === 0 && (
              <p className="px-5 py-3 text-sm text-muted-foreground italic">Nenhum aluno alocado</p>
            )}
          </div>
        </div>
      ))}

      {/* Export */}
      <Button size="lg" className="w-full text-base font-bold" onClick={handleExport}>
        <Download className="mr-2 h-5 w-5" />
        Exportar Excel com Distribuição
      </Button>
    </div>
  );
};

export default DistributionResult;
