import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { LoginService } from 'src/app/services/login.service';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user';
import { Trip } from 'src/app/models/trip';
import { TripService } from 'src/app/services/trip.service';

@Component({
  selector: 'app-index',
  templateUrl: './index.page.html',
  styleUrls: ['./index.page.scss'],
})
export class IndexPage implements OnInit {
  user: User | null = null;
  destino: string = '';
  costoPorPersona: number | null = null;
  matricula: string = '';
  horario: string = '';
  choferNombre: string = '';
  asientosDisponibles: number | null = null;
  metodoPago: string = ''; 
  viajesRegistrados: Trip[] = [];
  mostrarFormulario: boolean = false;
  mostrarViajes: boolean = false;
  viajeSeleccionado: Trip | null = null;
  mostrarContenido: boolean = true;

  constructor(
    private alertController: AlertController,
    private toastController: ToastController,
    private loginService: LoginService,
    private router: Router,
    private tripService: TripService
  ) {
    if (!this.loginService.isAuth()) {
      this.router.navigate(['/log-in']);
    }
  }

  ngOnInit() {
    const user = this.loginService.getCurrentUser();
    if (user) {
      this.user = user;
      console.log('Usuario actual:', this.user);
      this.choferNombre = this.user.username; 
    }
    this.loadTrips();
  }

  async loadTrips() {
    this.tripService.getTrips().subscribe(
      (trips: Trip[]) => {
        this.viajesRegistrados = trips; 
      },
      (error) => {
        console.error('Error al cargar los viajes:', error);
      }
    );
  }

  async registrarViaje() {
    if (this.destino && this.costoPorPersona !== null && this.matricula && this.horario && this.choferNombre && this.asientosDisponibles !== null) {
      const nuevoViaje: Trip = {
        destination: this.destino,
        pricePerPerson: this.costoPorPersona,
        licensePlate: this.matricula,
        totalPassengers: 0,
        totalCapacity: this.asientosDisponibles,
        driverId: this.choferNombre,
        passengerIds: [],
        horario: this.horario,
      };

      this.viajesRegistrados.push(nuevoViaje);

      this.tripService.addTrip(nuevoViaje).subscribe(() => {
        this.viajesRegistrados.push(nuevoViaje);
        this.showToastMessage('Viaje registrado exitosamente', 'success');
        this.clear();
        this.mostrarFormulario = false;
        this.loadTrips(); 
      });

    } else {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Por favor, completa todos los campos: destino, costo por persona, matrícula, horario, nombre del chofer y asientos disponibles.',
        buttons: ['OK'],
      });

      await alert.present();
      await alert.onDidDismiss();
      this.showToastMessage('Error al registrar el viaje', 'danger');
    }
  }

  clear() {
    this.destino = '';
    this.costoPorPersona = null;
    this.matricula = '';
    this.horario = '';
    this.choferNombre = ''; 
    this.asientosDisponibles = null;
    this.metodoPago = ''; 
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

  mostrarFormularioViaje() {
    this.mostrarFormulario = true;
    this.mostrarViajes = false;
  }

  mostrarViajesRegistrados() {
    this.mostrarViajes = true;
    this.mostrarFormulario = false;
  }

  async registrarseEnViaje(viaje: Trip) {
    this.viajeSeleccionado = viaje;

    if (this.viajeSeleccionado && this.viajeSeleccionado.totalCapacity > this.viajeSeleccionado.totalPassengers) {
      const alert = await this.alertController.create({
        header: 'Método de Pago',
        message: 'Selecciona un método de pago:',
        inputs: [
          {
            name: 'metodoPago',
            type: 'radio',
            label: 'Efectivo',
            value: 'efectivo',
            checked: true
          },
          {
            name: 'metodoPago',
            type: 'radio',
            label: 'Transferencia',
            value: 'transferencia'
          },
        ],
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
          },
          {
            text: 'Confirmar',
            handler: (data) => {
              this.metodoPago = data.metodoPago;

              if (this.viajeSeleccionado) {
                this.viajeSeleccionado.passengerIds.push(this.user?.username || '');
                this.viajeSeleccionado.totalPassengers++; 

                this.loadTrips(); 

                this.showToastMessage(`Te has registrado exitosamente en el viaje usando ${this.metodoPago}`, 'success');
              }
            },
          },
        ],
      });
      await alert.present();
    } else {
      this.showToastMessage('No hay asientos disponibles para registrarse en este viaje.', 'danger');
    }
  }

  async verCapacidad(viaje: Trip) {
    const alert = await this.alertController.create({
      header: 'Capacidad del Viaje',
      message: `Asientos Disponibles: ${viaje.totalCapacity - viaje.totalPassengers}\n` +
               (viaje.passengerIds.length > 0 ? 'Participantes:\n' + viaje.passengerIds.join(', ') + `\n\nNombre: ${this.user?.username}` : 'No hay participantes registrados en este viaje.'),
      buttons: ['OK'],
    });
    await alert.present();
  }
}
