import { Injectable } from '@angular/core';
import { Trip } from '../models/trip';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TripService {

  private apiURL = 'http://localhost:3000/trips';

  constructor(
    private http: HttpClient
  ) { }

  getTrips() {
    return this.http.get<Trip[]>(this.apiURL);
  }

  addTrip(trip: Trip) {
    return this.http.post<Trip>(this.apiURL, {
      ...trip,
      id: trip.id.toString()
    });
  }

  getTripById(id: number) {
    return this.http.get<Trip>(this.apiURL + '/' + id);
  }

  getTripByDestination(destination: string) {
    return this.http.get<Trip[]>(this.apiURL + '?destination=' + destination);
  }

  editTrip(id: number, trip: Trip) {
    return this.http.patch<Trip>(this.apiURL + '/' + id, trip);
  }

  removeUserFromTrip(tripId: string, updatedTrip: any): Observable<any> {
    return this.http.put(`${this.apiURL}/${tripId}`, updatedTrip);
  }

  addPassenger(id: number, passengerId: string) {
  return this.http.get<Trip>(this.apiURL + '/' + id).pipe(
    switchMap((trip) => {
      if (trip) {
        trip.passengerIds.push(passengerId);
        return this.http.patch<Trip>(this.apiURL + '/' + id, {
          passengerIds: trip.passengerIds,
          totalPassengers: trip.totalPassengers + 1
        });
      } else {
        throw new Error('Viaje no encontrado');
      }
    })
  );
}

}