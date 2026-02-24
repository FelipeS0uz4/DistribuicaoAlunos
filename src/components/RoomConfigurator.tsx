import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Minus, DoorOpen, Users } from "lucide-react";

export interface RoomData {
  name: string;
  seats: number;
  
}

interface RoomConfiguratorProps {
  rooms: RoomData[];
  onRoomsChange: (rooms: RoomData[]) => void;
  totalStudents?: number;
}

const RoomConfigurator: React.FC<RoomConfiguratorProps> = ({
  rooms,
  onRoomsChange,
  totalStudents = 0,
}) => {
  const [roomCount, setRoomCount] = useState(rooms.length || 1);

  const totalSeats = rooms.reduce((sum, room) => sum + (room.seats || 0), 0);
  const studentsMissing = Math.max(0, totalStudents - totalSeats);

  useEffect(() => {
    const current = rooms.length;
    if (roomCount > current) {
      const newRooms = [...rooms];
      for (let i = current; i < roomCount; i++) {
        newRooms.push({ name: "", seats: 0 });
      }
      onRoomsChange(newRooms);
    } else if (roomCount < current) {
      onRoomsChange(rooms.slice(0, roomCount));
    }
  }, [roomCount]);

  const updateRoom = (index: number, field: keyof RoomData, value: string | number) => {
    const updated = [...rooms];
    updated[index] = { ...updated[index], [field]: value };
    onRoomsChange(updated);
  };

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <DoorOpen className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-bold text-foreground">Configuração de Salas</h3>
      </div>

      {totalStudents > 0 && (
        <div className="mb-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                Total de alunos: <span className="text-lg font-bold">{totalStudents}</span>
              </p>
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                Total de assentos: <span className="text-lg font-bold">{totalSeats}</span>
              </p>
            </div>
            <div>
              <p className={`text-center text-xs font-semibold uppercase tracking-wider ${
                studentsMissing > 0 
                  ? "text-orange-600 dark:text-orange-400" 
                  : "text-green-600 dark:text-green-400"
              }`}>
                {studentsMissing > 0 ? "Faltam" : "Assentos suficientes"}
              </p>
              <p className={`text-2xl font-bold ${
                studentsMissing > 0 
                  ? "text-orange-600 dark:text-orange-400" 
                  : "text-green-600 dark:text-green-400"
              }`}>
                {studentsMissing}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <Label className="mb-2 block text-sm font-semibold text-foreground">
          Quantidade de salas
        </Label>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setRoomCount(Math.max(1, roomCount - 1))}
            className="h-10 w-10 rounded-lg"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="min-w-[3rem] text-center text-2xl font-bold text-primary">
            {roomCount}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setRoomCount(roomCount + 1)}
            className="h-10 w-10 rounded-lg"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {rooms.map((room, index) => (
          <div
            key={index}
            className="rounded-lg border bg-secondary/30 p-4 transition-all hover:shadow-sm"
          >
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-primary">
              Sala {index + 1}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label className="mb-1 flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                  <DoorOpen className="h-3 w-3" />
                  Nome da sala
                </Label>
                <Input
                  placeholder={`Ex: Sala ${index + 1}A`}
                  value={room.name}
                  onChange={(e) => updateRoom(index, "name", e.target.value)}
                  className="bg-card"
                />
              </div>
              <div>
                <Label className="mb-1 flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                  <Users className="h-3 w-3" />
                  Assentos
                </Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="Qtd. assentos"
                  value={room.seats || ""}
                  onChange={(e) =>
                    updateRoom(index, "seats", parseInt(e.target.value) || 0)
                  }
                  className="bg-card"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomConfigurator;
