import { Injectable } from '@angular/core';
import { Trip } from '../models/trip';
import { HttpClient } from '@angular/common/http';

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
    return this.http.post<Trip>(this.apiURL, trip);
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
}
