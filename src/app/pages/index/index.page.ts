import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { LoginService } from 'src/app/services/login.service';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user';
import { Trip } from 'src/app/models/trip';
import { TripService } from 'src/app/services/trip.service';
import { Storage } from '@ionic/storage-angular';
import { ViewWillEnter } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-index',
  templateUrl: './index.page.html',
  styleUrls: ['./index.page.scss'],
})
export class IndexPage implements OnInit, ViewWillEnter {
  user: User | null = null;
  metodoPago: string = '';
  viajeSeleccionado: Trip | null = null;
  segment: string = 'Viajes';
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
    licensePlate: '',
    driverId: 0,
    passengerIds: [],
    horario: '',
  };

  constructor(
    private alertController: AlertController,
    private toastController: ToastController,
    private loginService: LoginService,
    private router: Router,
    private tripService: TripService,
    private storage: Storage,
    public loading: LoadingController 
  ) {}

  ngOnInit(): void {
    this.ionViewWillEnter();
    console.log(this.user);
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

  async loadTrips() {
    const loading = await this.presentLoading('Cargando viajes...');
    this.tripService.getTrips().subscribe(
      async (trips: Trip[]) => {
        this.trips = trips;

        // Obtener el último ID de viaje
        if (this.trips.length > 0) {
          this.lastTripId = Math.max(...this.trips.map(trip => trip.id));
        } else {
          this.lastTripId = 0; // Si no hay viajes, iniciar desde 0
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
      licensePlate: '',
      driverId: 0,
      passengerIds: [],
      horario: '',
    };
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

  mostrarFormularioViaje() {
    this.segment = 'mostrarFormulario'; 
  }

  mostrarViajesRegistrados() {
    this.segment = 'mostrarViajes';
  }

  async registrarseEnViaje(viaje: Trip) {
    this.viajeSeleccionado = viaje;

    if (this.viajeSeleccionado && this.viajeSeleccionado.totalCapacity > this.viajeSeleccionado.totalPassengers) {
      const alert = await this.alertController.create({
        header: 'Método de Pago',
        message: 'Selecciona un método de pago:',
        inputs: [
          { name: 'metodoPago', type: 'radio', label: 'Efectivo', value: 'efectivo', checked: true },
          { name: 'metodoPago', type: 'radio', label: 'Transferencia', value: 'transferencia' },
        ],
        buttons: [
          {
        text: 'Cancelar', role: 'cancel', handler: () => {
          this.viajeSeleccionado = null;
        }
          },
          {
            text: 'Confirmar',
            handler: (data) => {
              this.metodoPago = data;
              this.tripService.addPassenger(this.viajeSeleccionado!.id, this.user!.id.toString() || '')
                .subscribe((response) => {
                  if (response) {
                    this.loadTrips();
                    this.showToastMessage(`Registrado exitosamente en el viaje con ${this.metodoPago}`, 'success');
                  }
                    }, (error) => {
                  this.showToastMessage('No se pudo registrar. Intenta de nuevo.', 'danger');
                    });
            },
              },
        ],
      });
      await alert.present();
    } else {
      this.showToastMessage('No hay asientos disponibles en este viaje.', 'danger');
    }
  }

  async verCapacidad(viaje: Trip) {
    const cantidadPasajeros = viaje.passengerIds.length;
    const mensajeParticipantes = cantidadPasajeros > 0 
      ? `Participantes: ${cantidadPasajeros}` 
      : 'No hay pasajeros registrados aún';

    const alert = await this.alertController.create({
      header: 'Capacidad del Viaje',
      message: `Asientos Disponibles: ${viaje.totalCapacity - viaje.totalPassengers}\n` +
              mensajeParticipantes,
      buttons: ['OK'],
    });
    await alert.present();
  }

  async removeSelfFromTrip(viaje: Trip) {
    if (viaje.passengerIds.includes(this.user!.id.toString())) {
      const alert = await this.alertController.create({
        header: 'Cancelar Registro',
        message: '¿Estás seguro de que quieres cancelar tu registro en este viaje?',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => {
              console.log('Eliminación cancelada');
            }
          },
          {
            text: 'Eliminar',
            handler: () => {
              // Si se confirma, elimina al usuario del viaje
              this.confirmRemoveSelfFromTrip(viaje);
            }
          }
        ]
      });

      await alert.present();
    } else {
      this.showToastMessage('No estás registrado en este viaje', 'danger');
    }
  }

   async confirmRemoveSelfFromTrip(trip: any) {
    const updatedPassengerIds = trip.passengerIds.filter((id: string) => id !== this.user!.id.toString());
    const updatedTrip = {
      ...trip,
      passengerIds: updatedPassengerIds,
      totalPassengers: updatedPassengerIds.length
    };

    this.tripService.removeUserFromTrip(trip.id, updatedTrip).subscribe({
      next: async(response) => {
        if (response) {
          await this.loadTrips();
          this.showToastMessage('Saliste del viaje exitosamente', 'success');
        }
      },
      error:async (error) => {
        console.error('Error al salir del viaje:', error);
        this.showToastMessage('Error al salir del viaje. Inténtalo de nuevo.', 'danger');
      }
    });
  }

  async logout() {
    const loading = await this.loading.create({
      message: 'Cerrando sesión...',
      spinner: 'circles',
    });
    await loading.present();

    this.loginService.logOut();
    this.user = null;
    this.router.navigate(['/log-in']);
    
    loading.dismiss();
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
