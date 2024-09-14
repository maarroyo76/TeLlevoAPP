import { Component, OnInit } from '@angular/core';
import { LoginService } from 'src/app/services/login.service';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  username: string = '';
  password: string = '';
  name: string = '';
  lastname: string = '';
  email: string = '';

  constructor(
    private loginService: LoginService,
    private toastController: ToastController,
    private router: Router
  ) { }

  ngOnInit() { }

  isFormValid(): boolean {
    return this.username.trim() !== '' &&
           this.password.trim() !== '' &&
           this.name.trim() !== '' &&
           this.lastname.trim() !== '' &&
           this.email.trim() !== '';
  }

  register() {
    if (!this.isFormValid()) {
      this.showToastMessage('Todos los campos son requeridos', 'danger');
      return;
    }

    const isRegistered = this.loginService.registerUser(this.username, this.password, this.name, this.lastname, this.email);
    if (isRegistered) {
      this.showToastMessage('Registro exitoso!', 'success');
      this.router.navigate(['/home']);
    } else {
      this.showToastMessage('Nombre de usuario ya en uso', 'warning');
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
