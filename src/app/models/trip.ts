export interface Trip {
  destination: string;         // Destino del viaje
  pricePerPerson: number;      // Precio por persona
  totalPassengers: number;     // Total de pasajeros actualmente reservados
  totalCapacity: number;       // Capacidad máxima de pasajeros
  licensePlate: string;        // Patente del vehículo
  driverId: string;            // ID del conductor
  passengerIds: string[];      // Lista de IDs de los pasajeros
}
