import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-destination-modal',
  templateUrl: './destination-modal.component.html',
  styleUrls: ['./destination-modal.component.scss']
})
export class DestinationModalComponent {
  destination: string = '';

    constructor(
        private modalController: ModalController,
        private toastController: ToastController
    ) { }

  dismissModal() {
    this.modalController.dismiss(null, 'cancel');
  }

  confirmDestination() {
      if (!this.destination) {
        this.toastController.create({
          message: 'Debes ingresar un destino',
          duration: 2000
        }).then(toast => {
          toast.present();
        });
      return;
    }
    this.modalController.dismiss(this.destination, 'confirm');
  }
}
