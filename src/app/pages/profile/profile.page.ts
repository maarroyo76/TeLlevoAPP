import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/services/login.service';
import { LoadingController, AlertController } from '@ionic/angular';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  user: any = {};

  constructor(
    private router: Router,
    private loginService: LoginService,
    private loading: LoadingController,
    private alert: AlertController
  ) { }


  async ngOnInit() {
    this.user = await this.loginService.getCurrentUser();
  }


  goBack() {
    this.router.navigate(['/home']);
  }

  async logOut() {
    const alert = await this.alert.create({
      header: 'Cerrar sesión',
      message: '¿Estás seguro que deseas cerrar sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        }, {
          text: 'Aceptar',
          handler: async () => {
            const loading = await this.presentLoading('Cerrando sesión...');
            await this.loginService.logOut();
            this.user = null;
            this.router.navigate(['/log-in']);
            loading.dismiss();
          }
        }
      ]
    });
    await alert.present();
  }

  async presentLoading(message: string = 'Cargando...') {
    const loading = await this.loading.create({
      message,
      spinner: 'circles',
    });
    await loading.present();
    return loading;
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alert.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  async dismissLoading() {
    await this.loading.dismiss();
  }

}