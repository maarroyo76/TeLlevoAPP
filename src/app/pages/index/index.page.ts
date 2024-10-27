import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { LoginService } from 'src/app/services/login.service';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user';
import { Trip } from 'src/app/models/trip'; // Asegúrate de importar Trip
import { TripService } from 'src/app/services/trip.service'; // Asegúrate de importar TripService

export interface Participante {
  nombre: string;
  apellido: string;
  metodoPago: string;
}

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

  viajesRegistrados: Trip[] = []; // Cambiado a tipo Trip
  mostrarFormulario: boolean = false;
  mostrarViajes: boolean = false;
  viajeSeleccionado: Trip | null = null; // Cambiado a tipo Trip
  nombre: string = '';
  apellido: string = '';
  metodoPago: string = '';
  mostrarRegistroViaje: boolean = false;
  mostrarContenido: boolean = true;

  constructor(
    private alertController: AlertController,
    private toastController: ToastController,
    private loginService: LoginService,
    private router: Router,
    private tripService: TripService // Añadido TripService
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
    }
    this.loadTrips(); // Cargar los viajes disponibles
  }

  async loadTrips() {
    this.tripService.getTrips().subscribe(
      (trips: Trip[]) => {
        this.viajesRegistrados = trips; // Guardar los viajes cargados
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

      // Guarda el nuevo viaje en la API
      this.tripService.addTrip(nuevoViaje).subscribe(() => {
        this.viajesRegistrados.push(nuevoViaje); // Agregar localmente
        this.showToastMessage('Viaje registrado exitosamente', 'success');
        this.clear();
        this.mostrarFormulario = false;
        this.loadTrips(); // Cargar nuevamente los viajes
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
    this.nombre = '';
    this.apellido = '';
    this.metodoPago = '';
    this.mostrarRegistroViaje = false;
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

  registrarseEnViaje(viaje: Trip) {
    this.viajeSeleccionado = viaje;
    this.mostrarRegistroViaje = true;
  }

  async registrarParticipante() {
    if (this.nombre && this.apellido && this.metodoPago) {
      if (this.viajeSeleccionado && this.viajeSeleccionado.totalCapacity > this.viajeSeleccionado.totalPassengers) {
        this.viajeSeleccionado.passengerIds.push(this.nombre + ' ' + this.apellido); // Agregar el participante por ID o nombre
        this.viajeSeleccionado.totalPassengers++; // Incrementar el número de pasajeros

        this.showToastMessage('Te has registrado exitosamente en el viaje', 'success');
        this.clear();
        this.mostrarRegistroViaje = false;
      } else {
        const alert = await this.alertController.create({
          header: 'Error',
          message: 'No hay asientos disponibles para registrarse en este viaje.',
          buttons: ['OK'],
        });
        await alert.present();
      }
    } else {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Por favor, completa todos los campos: nombre, apellido y método de pago.',
        buttons: ['OK'],
      });

      await alert.present();
      await alert.onDidDismiss();
      this.showToastMessage('Error al registrarte en el viaje', 'danger');
    }
  }

  async verCapacidad(viaje: Trip) {
    const alert = await this.alertController.create({
      header: 'Capacidad del Viaje',
      message: `Asientos Disponibles: ${viaje.totalCapacity - viaje.totalPassengers}\n` +
               (viaje.passengerIds.length > 0 ? 'Participantes:\n' + viaje.passengerIds.join(', ') : 'No hay participantes registrados en este viaje.'),
      buttons: ['OK'],
    });
    await alert.present();
  }
}
