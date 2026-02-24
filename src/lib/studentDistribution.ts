import * as XLSX from "xlsx";

export interface Aluno {
  nome: string;
  turma: string;
}

export interface SalaDistribuida {
  numero: string;
  qtdLugares: number;
  alunos: Aluno[];
}

/**
 * Reads students from selected sheets of the workbook.
 * Expects column B (index 1, "Unnamed: 1") = nome, and
 * the header row (row 0) has "PROVA P6" or similar in some column for turma.
 * Data starts at row index 3 (4th data row after header).
 */
export function lerAlunosDasPlanilhas(
  workbook: XLSX.WorkBook,
  sheetNames: string[]
): Aluno[] {
  const alunos: Aluno[] = [];

  for (const sheetName of sheetNames) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;

    // Convert sheet to array of arrays (raw)
    const data: any[][] = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: null,
    });

    if (data.length < 4) continue;

    // Find the column index for "PROVA P6" in the header row (row 0)
    const headerRow = data[0] as any[];
    let turmaColIndex = -1;
    if (headerRow) {
      turmaColIndex = headerRow.findIndex(
        (cell) =>
          typeof cell === "string" &&
          cell.toUpperCase().includes("PROVA")
      );
    }

    // If not found, default to column index that has turma info
    // Fallback: use col 0 or skip
    const nomeColIndex = 1; // "Unnamed: 1" = column B (index 1)
    if (turmaColIndex === -1) {
      // Try to find any column with class-like data; fallback to col with header containing "PROVA"
      // If still not found, use the sheet name as turma
      for (let rowIdx = 3; rowIdx < data.length; rowIdx++) {
        const row = data[rowIdx];
        if (!row) continue;
        const nome = row[nomeColIndex];
        if (nome && typeof nome === "string" && nome.trim()) {
          alunos.push({ nome: nome.trim(), turma: sheetName });
        }
      }
      continue;
    }

    // Read from row 3 onwards
    for (let rowIdx = 3; rowIdx < data.length; rowIdx++) {
      const row = data[rowIdx];
      if (!row) continue;
      const nome = row[nomeColIndex];
      const turma = row[turmaColIndex];
      if (
        nome &&
        turma &&
        typeof nome === "string" &&
        nome.trim() &&
        String(turma).trim()
      ) {
        alunos.push({ nome: nome.trim(), turma: String(turma).trim() });
      }
    }
  }

  return alunos;
}

/**
 * Interleave students by class, then shuffle lightly (same as Python logic).
 */
export function misturarAlunos(alunos: Aluno[]): Aluno[] {
  // Group by turma
  const grupos: Record<string, Aluno[]> = {};
  for (const aluno of alunos) {
    if (!grupos[aluno.turma]) grupos[aluno.turma] = [];
    grupos[aluno.turma].push(aluno);
  }

  // Interleave
  const listaFinal: Aluno[] = [];
  const turmas = Object.keys(grupos);
  let hasMore = true;
  while (hasMore) {
    hasMore = false;
    for (const turma of turmas) {
      if (grupos[turma].length > 0) {
        listaFinal.push(grupos[turma].shift()!);
        hasMore = true;
      }
    }
  }

  // Light shuffle (Fisher-Yates)
  for (let i = listaFinal.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [listaFinal[i], listaFinal[j]] = [listaFinal[j], listaFinal[i]];
  }

  return listaFinal;
}

/**
 * Distribute students into rooms sequentially.
 */
export function distribuirAlunosSalas(
  alunos: Aluno[],
  salas: { numero: string; qtdLugares: number }[]
): SalaDistribuida[] {
  let index = 0;
  return salas.map((sala) => {
    const alunosDaSala: Aluno[] = [];
    for (let i = 0; i < sala.qtdLugares && index < alunos.length; i++) {
      alunosDaSala.push(alunos[index]);
      index++;
    }
    return { ...sala, alunos: alunosDaSala };
  });
}

/**
 * Create an Excel workbook from the distribution result.
 */
export function criarExcelDistribuicao(salas: SalaDistribuida[]): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();
  for (const sala of salas) {
    const data = sala.alunos.map((a, i) => ({
      Nome: a.nome,
      Turma: a.turma,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, `Sala ${sala.numero}`);
  }
  return wb;
}
