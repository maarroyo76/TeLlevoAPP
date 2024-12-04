export interface Trip {
  id: number;
  driverName: string;
  destination: string;
  pricePerPerson: number;
  totalPassengers: number;
  totalCapacity: number;
  licensePlate: string;
  status: string;
  driverId: number;
  passengerIds: string[];
  horario: string;
  startPoint?: { lat: number; lng: number }; // Hacer opcional
  destinationPoint?: { lat: number; lng: number }; // Hacer opcional
  passengerDestinations: { id: string; coords: { lat: number; lng: number } }[];
}
