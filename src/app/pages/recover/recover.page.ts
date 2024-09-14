import { Component, OnInit } from '@angular/core';
import { LoginService } from 'src/app/services/login.service';
import { AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recover',
  templateUrl: './recover.page.html',
  styleUrls: ['./recover.page.scss'],
})
export class RecoverPage implements OnInit {
  name: string = '';
  lastname: string = '';
  username: string = '';
  newPassword: string = '';

  constructor(
    private loginService: LoginService,
    private alertController: AlertController,
    private toastController: ToastController,
    private router: Router
  ) { }

  ngOnInit() {
  }

  isFormValid(): boolean {
    return this.name.trim() !== '' &&
           this.lastname.trim() !== '' &&
           this.username.trim() !== '';
  }

  async recoverPassword() {
    if (this.isFormValid()) {
      const alert = await this.alertController.create({
        header: 'Recuperar contraseña',
        inputs: [
          {
            name: 'newPassword',
            type: 'password',
            placeholder: 'Nueva contraseña'
          }
        ],
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
          },
          {
            text: 'Guardar',
            handler: (data) => {
              if (data.newPassword.trim() === '') {
                this.showToastMessage('La contraseña no puede estar vacía', 'warning');
              }
              const isRecovered = this.loginService.changePassword(this.username, data.newPassword);
              if (isRecovered) {
                this.showToastMessage('Contraseña cambiada exitosamente', 'success');
                this.router.navigate(['/home']);
                this.clear();
              } else {
                this.showToastMessage('Usuario no encontrado', 'warning');
              }
              return true; 
            }
          }
        ]
      });
      await alert.present();
    } else {
      this.showToastMessage('Todos los campos son requeridos', 'danger');
    }
  }
  clear() {
    this.username = '';
    this.name = '';
    this.lastname = '';
    this.newPassword = '';
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

}
