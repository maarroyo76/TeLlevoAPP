import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/services/login.service';
import { LoadingController, AlertController, ToastController } from '@ionic/angular';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  user: any = {};

  newPassword!: string;
  oldPassword!: string;
  confirmPassword!: string;

  constructor(
    private router: Router,
    private loginService: LoginService,
    private loading: LoadingController,
    private alert: AlertController,
    private toast: ToastController
  ) { }


  async ngOnInit() {
    this.user = await this.loginService.getCurrentUser();
  }

  private  async updateProfile() {
    const userId = this.user.id;
    this.loginService.updateUser(userId, this.user).subscribe(async (user: any) => {
      await this.loginService.updateStorage(user);
      this.user = user;
      await this.createToast('Perfil actualizado correctamente.', 'success');
    });
  }

  private async changePassword() {
    if (this.oldPassword === this.user.password && this.newPassword === this.confirmPassword) {
      this.user.password = this.newPassword;
      const userId = this.user.id;
      this.loginService.updateUser(userId, this.user).subscribe(async (user: any) => {
        await this.loginService.updateStorage(user);
        this.user = user;
        await this.createToast('Contraseña actualizada correctamente.', 'success');
      });
    } else {
      await this.presentAlert('Error', 'La contraseña actual no coincide.');
    }
  }
  async confirmChangePassword() {
    const alert = await this.alert.create({
      header: 'Confirmar cambio de contraseña',
      message: '¿Estás seguro que deseas cambiar tu contraseña?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        }, {
          text: 'Aceptar',
          handler: async () => {
            this.changePassword();
          }
        }
      ]
    });
    await alert.present();
  }

  async confirmUpdateProfile() {
    const alert = await this.alert.create({
      header: 'Confirmar actualización',
      message: '¿Estás seguro que deseas actualizar tu perfil?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        }, {
          text: 'Aceptar',
          handler: async () => {
            this.updateProfile();
          }
        }
      ]
    });
    await alert.present();
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

  async createToast(message: string, color: string) {
    const toast = await this.toast.create({
      message,
      duration: 2000,
      color,
    });
    await toast.present();
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