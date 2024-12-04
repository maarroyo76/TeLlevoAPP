import { AfterViewInit, Component, ViewChild, ElementRef } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';

declare var google: any;

@Component({
  selector: 'app-destination-modal',
  templateUrl: './destination-modal.component.html',
  styleUrls: ['./destination-modal.component.scss'],
})
export class DestinationModalComponent {
  @ViewChild('destinationInput', { static: false }) destinationInput: ElementRef | undefined;
  autocomplete: any;
  destination: string = '';
  coords: { lat: number; lng: number } | null = null; // Almacena las coordenadas


  geocoder = new google.maps.Geocoder();
  constructor(
    private modalController: ModalController,
    private toastController: ToastController
  ) {}

  ionViewDidEnter() {
    if (this.destinationInput) {
      this.loadGooglePlacesAutocomplete();
    } else {
      console.error('El elemento destinationInput no está disponible.');
    }
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
          console.log('Coordenadas seleccionadas:', this.coords);
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



  async confirmDestination() {
    if (!this.destination) {
      const toast = await this.toastController.create({
        message: 'Debes ingresar un destino',
        duration: 2000,
        position: 'top',
        color: 'danger',
      });
      await toast.present();
      return;
    }

    try {
      const coords = this.coords || (await this.geocodeAddress(this.destination));
      console.log('Destino confirmado:', { destination: this.destination, coords });
      this.modalController.dismiss({ destination: this.destination, coords }, 'confirm');
    } catch (error) {
      console.error('Error al confirmar el destino:', error);
      const toast = await this.toastController.create({
        message: 'Hubo un problema al obtener las coordenadas',
        duration: 2000,
        position: 'top',
        color: 'danger',
      });
      await toast.present();
    }
  }

  dismissModal() {
    this.modalController.dismiss(null, 'cancel');
  }
}
