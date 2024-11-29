export interface Trip {
  id: number;                  // ID del viaje
  driverName: string;          // Nombre del conductor
  destination: string;         // Destino del viaje
  pricePerPerson: number;      // Precio por persona
  totalPassengers: number;     // Total de pasajeros actualmente reservados
  totalCapacity: number;       // Capacidad máxima de pasajeros
  licensePlate: string;        // Patente del vehículo
  driverId: number;            // ID del conductor
  passengerIds: string[];      // Lista de IDs de los pasajeros
  horario: string;             // Horario de salida
  startPoint: string[];          // Punto de partida
  destinationPoint: string[];    // Punto de destino
  passengerDestinations: { id: string;  coords: { lat: number; lng: number } }[];
}
