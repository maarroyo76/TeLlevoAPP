import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Trip } from 'src/app/models/trip';
import { ToastController, AlertController, ModalController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { User } from 'src/app/models/user';
import { LoginService } from 'src/app/services/login.service';
import { TripService } from 'src/app/services/trip.service';
import { DestinationModalComponent } from './destination-modal.component';


@Component({
  selector: 'app-viaje',
  templateUrl: './viaje.page.html',
  styleUrls: ['./viaje.page.scss'],
})
export class ViajePage implements OnInit {
  user: User | null = null;
  viaje: Trip | null = null;
  availableSeats!: number;
  metodoPago!: string;
  destino!: string;
  coords!: { lat: number; lng: number };
  isTripStarted: boolean = false;

  constructor(
    private router: Router,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private storage: Storage,
    private loginService: LoginService,
    private tripService: TripService
  ) { }

  async ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.viaje = navigation?.extras.state['viaje'];
      this.user = await this.loginService.getCurrentUser();
    }else {
      this.router.navigate(['/home']);
    }
    this.loadViaje();
    this.checkTripStatus();
  }

  ngAfterViewInit() {
    this.loadMap();
  }

  loadViaje() {
    this.tripService.getTripById(this.viaje!.id).subscribe({
      next: (response) => {
        this.viaje = response;
        this.calculateAvailableSeats();
      },
      error: (error) => {
        console.error('Error al cargar el viaje:', error);
      }
    });
  }

  isUserRegistered(): boolean {
    if (!this.viaje || !this.user) {
      return false;
    }
    return this.viaje.passengerIds.includes(this.user.id.toString());
  }

  calculateAvailableSeats() {
    this.availableSeats = this.viaje!.totalCapacity! - this.viaje!.totalPassengers!;
  }

  async checkTripStatus() {
    const tripStatus = await this.storage.get('tripStatus');
    if (tripStatus && tripStatus.id === this.viaje?.id && tripStatus.isStarted) {
      this.isTripStarted = true;
    }
  }

  async reservarViaje() {
    if (this.availableSeats > 0) {
      const modal = await this.modalCtrl.create({
        component: DestinationModalComponent,
      });
      await modal.present();

      const { data, role } = await modal.onDidDismiss();

      if (role === 'confirm') {
        const destino = data;
        const coords = await this.getCoordinatesFromAddress(destino);

        if (!coords) {
          this.createToast('No se pudieron obtener las coordenadas del destino.', 'danger');
          return;
        }
      }

      const alert = await this.alertCtrl.create({
        header: 'Método de Pago',
        message: 'Selecciona un método de pago:',
        inputs: [
          { name: 'metodoPago', type: 'radio', label: 'Efectivo', value: 'efectivo', checked: true },
          { name: 'metodoPago', type: 'radio', label: 'Transferencia', value: 'transferencia' },
        ],
        buttons: [
          {
            text: 'Cancelar', role: 'cancel', handler: () => {
              this.createToast('Reservación cancelada', 'danger');
            }
          },
          {
            text: 'Aceptar',
            handler: (data: any) => {
              this.metodoPago = data.metodoPago;
              this.tripService.addPassenger(this.viaje!.id, this.user!.id.toString(), this.destino, this.coords)
                .subscribe({
                  next: (response: any) => {
                    if (response) {
                      this.loadViaje();
                      this.createToast(`Registrado exitosamente en el viaje con ${this.metodoPago}`, 'success');
                    }
                  },
                  error: (error: any) => {
                    this.createToast('No se pudo registrar. Intenta de nuevo.', 'danger');
                  }
                });
            }
          }
        ]
      });
      await alert.present();
    } else {
      this.createToast('No hay asientos disponibles en este viaje.', 'danger');
    }
  }

  async removeSelfFromTrip(viaje: Trip) {
    if (viaje.passengerIds.includes(this.user!.id.toString())) {
      const alert = await this.alertCtrl.create({
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
              this.confirmRemoveSelfFromTrip(viaje);
            }
          }
        ]
      });
      await alert.present();
      this.loadViaje();
    } else {
      this.createToast('No estás registrado en este viaje', 'danger');
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
          this.createToast('Saliste del viaje exitosamente', 'success');
        }
      },
      error:async (error) => {
        console.error('Error al salir del viaje:', error);
        this.createToast('Error al salir del viaje. Inténtalo de nuevo.', 'danger');
      }
    });
  }

  async startTrip() {
    const alert = await this.alertCtrl.create({
      header: 'Iniciar Viaje',
      message: '¿Estás seguro de que quieres iniciar el viaje?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => console.log('Inicio de viaje cancelado'),
        },
        {
          text: 'Iniciar',
          handler: async () => {
            this.isTripStarted = true;
            await this.storage.set('tripStatus',{id: this.viaje?.id, status: 'started'});
            this.createToast('El viaje ha comenzado', 'success');
          },
        },
      ],
    });
    await alert.present();
  }

  async endTrip() {
    const alert = await this.alertCtrl.create({
      header: 'Terminar Viaje',
      message: '¿Estás seguro de que quieres terminar este viaje? Esto lo eliminará definitivamente.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => console.log('Finalización cancelada'),
        },
        {
          text: 'Terminar',
          handler: () => {
            this.deleteTrip();
          },
        },
      ],
    });
    await alert.present();
  }

  async deleteTrip() {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar Viaje',
      message: '¿Estás seguro de que quieres eliminar este viaje? Esta acción no se puede deshacer.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => console.log('Eliminación cancelada'),
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.tripService.deleteTrip(this.viaje!.id).subscribe({
              next: () => {
                this.createToast('El viaje ha sido eliminado', 'success');
                this.router.navigate(['/home']);
              },
              error: (error) => {
                console.error('Error al eliminar el viaje:', error);
                this.createToast('No se pudo eliminar el viaje. Intenta de nuevo.', 'danger');
              },
            });
          },
        },
      ],
    });
    await alert.present();
  }

  async getCoordinatesFromAddress(address: string): Promise<{ lat: number; lng: number } | null> {
    const geocoder = new google.maps.Geocoder();
    return new Promise((resolve) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          resolve({ lat: location.lat(), lng: location.lng() });
        } else {
          console.error('Error al obtener coordenadas:', status);
          resolve(null);
        }
      });
    });
  }

  loadMap() {
    const mapElement = document.getElementById('map') as HTMLElement;
    if (mapElement) {
      const mapOptions: google.maps.MapOptions = {
        center: { lat: -33.5000852, lng: -70.6162928 }, 
        zoom: 18,
      };
      const map = new google.maps.Map(mapElement, mapOptions);
      
    } else {
      console.error('Elemento del mapa no encontrado');
    }
  }
  
  async createToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
      position: 'bottom',
    });
    toast.present();
  }

  async createAlert(header: string, message: string, buttons: any[] = ['Ok']) {
    const alertCtrl = await this.alertCtrl.create({
      header,
      message,
      buttons
    });
    alertCtrl.present();
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}
