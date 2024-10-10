import { Component, OnInit } from '@angular/core';
import { LoginService } from 'src/app/services/login.service';
import { AlertController, ToastController, AnimationController } from '@ionic/angular';
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
    private animationController: AnimationController,
    private router: Router
  ) { }

  ngAfterViewInit(): void {
    this.animationHeader();
    this.animationTitle();
    this.animationFooter();
    this.animationForm();
    this.animationButton();
  }

  ngOnInit() {
  }

  animationHeader() {
    const element = document.getElementById('header');
    if(element){
      this.animationController
      .create()
      .addElement(element)
      .duration(1500)
      .keyframes([
        { offset: 0, transform: 'translateX(-100px)', opacity: '0.1' },
        { offset: 0.5, transform: 'translateX(-50px)', opacity: '0.5' },
        { offset: 1, transform: 'translateX(0px)', opacity: '1' },
      ])
      .play()
    }
  }

  animationTitle() {
    const element = document.getElementById('title');
    if(element){
      this.animationController
      .create()
      .addElement(element)
      .duration(1500)
      .keyframes([
        { offset: 0, transform: 'translateY(-100px)', opacity: '0.1' },
        { offset: 0.5, transform: 'translateY(-50px)', opacity: '0.5' },
        { offset: 1, transform: 'translateY(0px)', opacity: '1' },
      ])
      .play()
    }
  }

  animationForm() {
    const element = document.getElementById('form');
    if(element){
      this.animationController
      .create()
      .addElement(element)
      .duration(2000)
      .keyframes([
        { offset: 0, transform: 'translateY(0px)', opacity: '0' },
        { offset: 0.25, transform: 'translateY(0px)', opacity: '0.3' },
        { offset: 0.5, transform: 'translateY(0px)', opacity: '0.6' },
        { offset: 0.75, transform: 'translateY(0px)', opacity: '0.8' },
        { offset: 1, transform: 'translateY(0px)', opacity: '1' },
      ])
      .play()
    }
  }

  animationButton() {
    const element = document.getElementById('button');
    if(element){
      this.animationController
      .create()
      .addElement(element)
      .duration(1500)
      .keyframes([
        { offset: 0, transform: 'translateY(100px)', opacity: '0.1' },
        { offset: 0.5, transform: 'translateY(50px)', opacity: '0.5' },
        { offset: 1, transform: 'translateY(0px)', opacity: '1' },
      ])
      .play()
    }
  }

  animationFooter() {
    const element = document.getElementById('footer');
    if(element){
      this.animationController
      .create()
      .addElement(element)
      .duration(1500)
      .keyframes([
        { offset: 0, transform: 'translateX(100px)', opacity: '0.1' },
        { offset: 0.5, transform: 'translateX(50px)', opacity: '0.5' },
        { offset: 1, transform: 'translateX(0px)', opacity: '1' },
      ])
      .play()
    }
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
                this.router.navigate(['/log-in']);
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
