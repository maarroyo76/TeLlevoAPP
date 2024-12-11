import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { LoginService } from 'src/app/services/login.service';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user';
import { Trip } from 'src/app/models/trip';
import { TripService } from 'src/app/services/trip.service';
import { Storage } from '@ionic/storage-angular';
import { ViewWillEnter } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { ModalController } from '@ionic/angular';

declare var google: any;

@Component({
  selector: 'app-index',
  templateUrl: './index.page.html',
  styleUrls: ['./index.page.scss'],
})
export class IndexPage implements OnInit, ViewWillEnter {
  @ViewChild('destinationInput', { static: false }) destinationInput: ElementRef | undefined;
  autocomplete: any;
  destination: string = '';
  coords: { lat: number; lng: number } | null = null; // Almacena las coordenadas

  geocoder = new google.maps.Geocoder();

  user: User | null = null;
  metodoPago: string = '';
  viajeSeleccionado: Trip | null = null;
  segment: string = 'mostrarViajes';
  mostrarFormulario: boolean = false;
  lastTripId: number = 0;
  driverName: string = '';
  trips: Trip[] = [];

  trip: Trip = {
    id: 0,
    driverName: '',
    destination: '',
    pricePerPerson: 0,
    totalPassengers: 0,
    totalCapacity: 0,
    licensePlate: this.user?.licensePlate || '',
    status: 'Programado',
    driverId: 0,
    passengerIds: [],
    horario: '',
    startPoint: { lat:-33.4991412, lng:-70.6176012}, // Coordenadas iniciales predeterminadas
    destinationPoint: { lat: 0, lng: 0 }, // Coordenadas de destino predeterminadas
    passengerDestinations: [],
  };

  constructor(
    private alertController: AlertController,
    private toastController: ToastController,
    private loginService: LoginService,
    private router: Router,
    private tripService: TripService,
    private storage: Storage,
    public loading: LoadingController,
    public modalController: ModalController
  ) {}

  ngOnInit(): void {
    this.ionViewWillEnter();
  }

  async ionViewWillEnter() {
    await this.storage.create();
    const isAuthenticated = await this.loginService.isAuth(); 

    if (!isAuthenticated) {
      this.router.navigate(['/log-in']);
    } else {
      this.user = await this.loginService.getCurrentUser();
      await this.loadTrips();
    }
  }

  goToViaje(viaje: Trip) {
    const navigationExtras = { state: { viaje } }; 
    this.router.navigate(['/viaje'], navigationExtras);
  }

  async loadTrips() {
    const loading = await this.presentLoading('Cargando viajes...');
    this.tripService.getTrips().subscribe(
      async (trips: Trip[]) => {
        this.trips = trips;

        if (this.trips.length > 0) {
          this.lastTripId = Math.max(...this.trips.map(trip => trip.id));
        } else {
          this.lastTripId = 0;
        }

        for (let trip of this.trips) {
          trip.driverName = await this.getDriverName(trip.driverId);
        }
        await loading.dismiss();
      },
      async(error) => {
        console.error('Error al cargar los viajes:', error);
        await loading.dismiss();
      }
    );
  }

  async getDriverName(id: number): Promise<string> {
    const cachedDriverName = await this.storage.get(`driver_${id}`);
    if (cachedDriverName) {
      return cachedDriverName;
    } else {
      return new Promise((resolve) => {
        this.loginService.getUserById(id).subscribe((user: User) => {
          const fullName = `${user.name} ${user.lastname}`;
          this.storage.set(`driver_${id}`, fullName);
          resolve(fullName);
        });
      });
    }
  }

  validateForm() {
    return this.trip.destination &&
      this.trip.pricePerPerson &&
      this.trip.totalCapacity &&
      this.trip.licensePlate &&
      this.trip.horario;
  }

  async registrarViaje() {
    if (this.validateForm()) {
      const loading = await this.presentLoading('Registrando viaje...');
      const nuevoViaje: Trip = {
        ...this.trip,
        id: this.lastTripId + 1,
        totalPassengers: 0,
        passengerIds: [],
        driverId: this.user!.id,
        driverName: `${this.user!.name} ${this.user!.lastname}`,
        startPoint: { lat: -33.4991412, lng: -70.6176012 },
        destinationPoint: this.coords || { lat: 0, lng: 0 },
      };

      this.tripService.addTrip(nuevoViaje).subscribe({
        next: async (response) => {
          if (response) {
            this.showToastMessage('Viaje registrado exitosamente', 'success');
            this.clear();
            this.mostrarFormulario = false;
            await this.loadTrips();
          }
          await loading.dismiss();
        },
        error: async (error) => {
          console.error('Error al registrar el viaje:', error);
          this.showToastMessage('Error al registrar el viaje. Inténtalo de nuevo.', 'danger');
          await this.dismissLoading();
        }
      });
    } else {
      this.showToastMessage('Error al registrar el viaje', 'danger');
    }
  }

  clear() {
    this.trip = {
      id: 0,
      driverName: '',
      destination: '',
      pricePerPerson: 0,
      totalPassengers: 0,
      totalCapacity: 0,
      licensePlate: this.user?.licensePlate || '',
      status: 'Programado',
      driverId: 0,
      passengerIds: [],
      horario: '',
      destinationPoint: { lat: 0, lng: 0 }, // Coordenadas de destino predeterminadas
      passengerDestinations: [],
    };
    this.destination = '';
  }

  async showToastMessage(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'bottom',
    });
    toast.present();
  }

  async presentAlert(header: string, message: string, buttons: any[] = ['OK']) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons,
    });
    await alert.present();
  }

  isUserPassenger(trip: Trip): boolean {
    return trip.passengerIds.includes((this.user?.id || -1).toString());
  }

  isUserDriver(trip: Trip): boolean {
    return trip.driverId === this.user?.id;
  }

  showingForm() {
    this.loadGooglePlacesAutocomplete();
  }

  loadGooglePlacesAutocomplete() {
    if (!google || !google.maps || !google.maps.places) {
      console.error('La API de Google Places no está cargada.');
      return;
    }

    const inputElement = this.destinationInput?.nativeElement;
    if (inputElement) {
      this.autocomplete = new google.maps.places.Autocomplete(inputElement, {
        types: ['geocode'],
        componentRestrictions: { country: 'cl' },
      });

      this.autocomplete.addListener('place_changed', () => {
        const place = this.autocomplete.getPlace();
        this.destination = place?.formatted_address || '';
        if (place.geometry && place.geometry.location) {
          const location = place.geometry.location;
          this.coords = { lat: location.lat(), lng: location.lng() };
        }
      });
    }
  }

  geocodeAddress(address: any): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {
      this.geocoder.geocode({ address: address }, (results: google.maps.GeocoderResult[], status: google.maps.GeocoderStatus) => {
        if (status === google.maps.GeocoderStatus.OK && results[0]) {
          const location = results[0].geometry.location;
          resolve({ lat: location.lat(), lng: location.lng() });
        } else {
          console.error('Error al geocodificar:', status);
          reject(new Error(`Geocoding falló: ${status}`));
        }
      });
    });
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  async presentLoading(message: string = 'Cargando...') {
    const loading = await this.loading.create({
      message,
      spinner: 'circles',
    });
    await loading.present();
    return loading;
  }

  async dismissLoading() {
    await this.loading.dismiss();
  }
}
