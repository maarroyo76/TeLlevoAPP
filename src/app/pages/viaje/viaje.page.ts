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
  ) { 
      this.router.routeReuseStrategy.shouldReuseRoute = () => false;
   }

  async ngOnInit() {
    try {
      const navigation = this.router.getCurrentNavigation();
      if (navigation?.extras.state && navigation.extras.state['viaje']) {
        this.viaje = navigation.extras.state['viaje'];
      } else {
        console.warn('No se encontraron datos del viaje. Redirigiendo al home...');
        this.router.navigate(['/home']);
      }
      this.user = await this.loginService.getCurrentUser();
      await this.loadViaje();
    } catch (error) {
      console.error('Error al cargar los datos:', error);
      this.router.navigate(['/home']);
    }
  }

  ngAfterViewInit() {
    this.loadMap();
  }

  loadViaje() {
    this.tripService.getTripById(this.viaje!.id).subscribe({
      next: (response) => {
        this.viaje = response;
        this.calculateAvailableSeats();
        this.loadMap();
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

  isTripFinished(): boolean {
    return this.viaje!.status === 'finalizado';
  }

  calculateAvailableSeats() {
    this.availableSeats = this.viaje!.totalCapacity! - this.viaje!.totalPassengers!;
  }

  async reservarViaje() {
    if (this.availableSeats > 0) {
      try {
        const modal = await this.modalCtrl.create({
          component: DestinationModalComponent,
        });
        await modal.present();

        const { data, role } = await modal.onDidDismiss();

        if (role === 'confirm' && data?.coords && data?.destination) {
          const destino = data.destination;
          const coords = data.coords;

          const alert = await this.alertCtrl.create({
            header: 'Método de Pago',
            message: 'Selecciona un método de pago:',
            inputs: [
              { name: 'metodoPago', type: 'radio', label: 'Efectivo', value: 'efectivo', checked: true },
              { name: 'metodoPago', type: 'radio', label: 'Transferencia', value: 'transferencia' },
            ],
            buttons: [
              {
                text: 'Cancelar',
                role: 'cancel',
                handler: () => {
                  this.createToast('Reservación cancelada', 'danger');
                },
              },
              {
                text: 'Aceptar',
                handler: (data: any) => {
                  this.metodoPago = data.metodoPago;
                  this.tripService.addPassenger(this.viaje!.id, this.user!.id.toString(), destino, coords)
                    .subscribe({
                      next: () => {
                        this.loadViaje();
                        this.createToast(`Registrado exitosamente en el viaje!`, 'success');
                      },
                      error: () => {
                        this.createToast('No se pudo registrar. Intenta de nuevo.', 'danger');
                      },
                    });
                },
              },
            ],
          });
          await alert.present();
        } else {
          this.createToast('No se seleccionó un destino válido.', 'danger');
        }
      } catch (error) {
        console.error('Error al reservar viaje:', error);
        this.createToast('Ocurrió un error al intentar reservar el viaje.', 'danger');
      }
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
    const userId = this.user!.id.toString();
    const updatedPassengerIds = trip.passengerIds.filter((id: string) => id !== userId);

    const updatedPassengerDestinations = trip.passengerDestinations.filter(
      (destination: { id: string; coords: { lat: number; lng: number } }) => destination.id !== userId
    );

    const updatedTrip = {
      ...trip,
      passengerIds: updatedPassengerIds,
      passengerDestinations: updatedPassengerDestinations,
      totalPassengers: updatedPassengerIds.length,
    };

    this.tripService.removeUserFromTrip(trip.id, updatedTrip).subscribe({
      next: async (response) => {
        if (response) {
          this.loadViaje();
          this.createToast('Saliste del viaje exitosamente', 'success');
        }
      },
      error: async (error) => {
        console.error('Error al salir del viaje:', error);
        this.createToast('Error al salir del viaje. Inténtalo de nuevo.', 'danger');
      },
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
          handler: () => this.createToast('Inicio cancelado', 'caution'),
        },
        {
          text: 'Iniciar',
          handler: async () => {
            this.tripService.startTrip(this.viaje!.id).subscribe({
              next: () => {
                this.isTripStarted = true;
              },
              error: (error) => {
                console.error('Error al iniciar el viaje:', error);
                this.createToast('No se pudo iniciar el viaje. Intenta de nuevo.', 'danger');
              },
            });
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
      message: '¿Estás seguro de que quieres terminar este viaje?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => this.createToast('Finalización cancelada', 'caution'),
        },
        {
          text: 'Terminar',
          handler: () => {
            this.tripService.endTrip(this.viaje!.id).subscribe({
              next: () => {
                this.isTripStarted = false;
              },
              error: (error) => {
                console.error('Error al finalizar el viaje:', error);
                this.createToast('No se pudo finalizar el viaje. Intenta de nuevo.', 'danger');
              },
            });
            this.createToast('El viaje ha finalizado', 'success');
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

    if (!mapElement || !this.viaje) {
      console.error('No se encontró el elemento del mapa o los datos del viaje no están disponibles.');
      return;
    }

    const startPoint = this.viaje.startPoint;
    const destinationPoint = this.viaje.destinationPoint;

    // Validar las coordenadas de startPoint y destinationPoint
    if (
      !startPoint || typeof startPoint.lat !== 'number' || typeof startPoint.lng !== 'number' ||
      !destinationPoint || typeof destinationPoint.lat !== 'number' || typeof destinationPoint.lng !== 'number'
    ) {
      console.error('Coordenadas inválidas:', { startPoint, destinationPoint });
      return;
    }

    // Configuración del mapa
    const mapOptions: google.maps.MapOptions = {
      center: {
        lat: startPoint.lat,
        lng: startPoint.lng,
      },
      zoom: 12,
    };

    const map = new google.maps.Map(mapElement, mapOptions);

    // Función para agregar marcadores avanzados
    const addAdvancedMarker = (position: google.maps.LatLngLiteral, title: string) => {
      new google.maps.Marker({
        position,
        map,
        title,
      });
    };

    // Agregar marcador para el punto de partida
    addAdvancedMarker({ lat: startPoint.lat, lng: startPoint.lng }, 'Punto de partida');

    // Agregar marcador para el destino
    addAdvancedMarker({ lat: destinationPoint.lat, lng: destinationPoint.lng }, 'Destino final');

    // Agregar marcadores para los destinos de los pasajeros
    if (this.viaje.passengerDestinations && this.viaje.passengerDestinations.length > 0) {
      this.viaje.passengerDestinations.forEach(dest => {
        if (dest.coords && typeof dest.coords.lat === 'number' && typeof dest.coords.lng === 'number') {
          addAdvancedMarker(
          { lat: dest.coords.lat, lng: dest.coords.lng },
          `Destino de pasajero ID: ${dest.id}`
          );
        }
      });
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
