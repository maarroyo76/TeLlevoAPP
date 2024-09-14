import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../services/login.service';
import { ToastController, AnimationController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  username!: string;
  password!: string;


  constructor(
    private toastController: ToastController,
    private router: Router,
    private loginService: LoginService,
    private animationController: AnimationController
  ) {}



  async validateLogin() {
    if(this.loginService.validateLogin(this.username, this.password)){
      this.showToastMessage('Login exitoso!', 'success')
      const navigationExtras = { 
         state: { 
           username: this.username
         }
       };
      this.router.navigate(['/index'], navigationExtras);
   }else{
      this.showToastMessage('Invalido!', 'danger');
   }
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
