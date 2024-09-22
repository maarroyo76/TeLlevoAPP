import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-index',
  templateUrl: './index.page.html',
  styleUrls: ['./index.page.scss'],
})
export class IndexPage implements OnInit {
  nombreUsuario: string;
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

  constructor(private alertController: AlertController) {
    this.nombreUsuario = 'Martin';
  }

  ngOnInit() {
    this.presentAlert();
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      header: '¿Tienes auto?',
      message: 'Elige una opción:',
      buttons: [
        {
          text: 'Sí',
          handler: () => {
            this.manejarRespuesta(true);
          }
        },
        {
          text: 'No',
          handler: () => {
            this.manejarRespuesta(false);
          }
        }
      ]
    });

    await alert.present();
  }

  manejarRespuesta(respuesta: boolean) {
    this.tieneAuto = respuesta;
    this.mostrarContenido = true;
  }

  registrarViaje() {
    console.log(`Destino: ${this.destino}, Costo por Persona: ${this.costoPorPersona}`);
  }

  seleccionarViaje(viaje: any) {
    this.viajeSeleccionado = viaje;
  }

  confirmarSeleccion() {
    if (this.viajeSeleccionado) {
      console.log(`Viaje confirmado: ${this.viajeSeleccionado.destino}, Costo: ${this.viajeSeleccionado.costo}`);
    }
  }
}
