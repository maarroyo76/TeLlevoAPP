import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController, AnimationController } from '@ionic/angular';
import { LoginService } from 'src/app/services/login.service';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-index',
  templateUrl: './index.page.html',
  styleUrls: ['./index.page.scss'],
})
export class IndexPage implements OnInit {
  user: User | null = null;
  tieneAuto: boolean = false;
  destino: string = '';
  costoPorPersona: number | null = null;
  viajesDisponibles = [
    { destino: 'Puente Alto ', costo: 2000 },
    { destino: 'La Florida', costo: 1500 },
    { destino: 'Estadio Nacional', costo: 1000 },
  ];
  viajeSeleccionado: any = null;
  mostrarContenido: boolean = false;

  constructor(
    private alertController: AlertController,
    private toastController: ToastController,
    private loginService: LoginService,
    private router: Router
  ) {
    if(!this.loginService.isAuth()){
      this.router.navigate(['/log-in']);
    }
  }

  ngAfterViewInit(): void {}

  ngOnInit() {
    const user = this.loginService.getCurrentUser();
    if (user) {
      this.user = user;
      console.log('Usuario actual:', this.user);
    }
    this.presentAlert();
  }

  logOut() {
    this.loginService.logOut();
    this.router.navigate(['/log-in']);
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      header: '¿Tienes auto?',
      message: 'Elige una opción:',
      buttons: [
        {
          text: 'Sí',
          cssClass: 'alert-button-true',
          handler: () => {
            this.manejarRespuesta(true);
          },
        },
        {
          text: 'No',
          cssClass: 'alert-button-false',
          handler: () => {
            this.manejarRespuesta(false);
          },
        },
      ],
    });

    await alert.present();
  }

  manejarRespuesta(respuesta: boolean) {
    this.tieneAuto = respuesta;
    this.mostrarContenido = true;
  }

  async confirmarSeleccion() {
    if (this.viajeSeleccionado) {
      const alert = await this.alertController.create({
        header: 'Confirmación de Viaje',
        message: `Viaje confirmado: ${this.viajeSeleccionado.destino} | \nCosto por persona: ${this.viajeSeleccionado.costo} CLP`,
        buttons: ['OK'],
      });
  
      await alert.present();

      await alert.onDidDismiss();
      this.clear();
      this.showToastMessage('Viaje confirmado exitosamente', 'success');
    }
  }
  
  async registrarViaje() {
    if (this.destino && this.costoPorPersona !== null) {
      const alert = await this.alertController.create({
        header: 'Registro de Viaje',
        message: `Destino del Viaje: ${this.destino} | \nCosto por persona: ${this.costoPorPersona} CLP`,
        buttons: ['OK'],
      });
  
      await alert.present();
      
      await alert.onDidDismiss();
      this.showToastMessage('Viaje registrado exitosamente', 'success');
      this.clear();
    } else {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Por favor, selecciona un destino y especifica el costo por persona.',
        buttons: ['OK'],
      });
  
      await alert.present();

      await alert.onDidDismiss();
      this.showToastMessage('Error al registrar el viaje', 'danger');
    }
  }
  

  seleccionarViaje(viaje: any) {
    this.viajeSeleccionado = viaje;
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

  clear() {
    this.destino = '';
    this.costoPorPersona = null;
    this.viajeSeleccionado = null;
  }
}

