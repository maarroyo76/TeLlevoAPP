import { Component, OnInit } from '@angular/core';
import { LoginService } from 'src/app/services/login.service';
import { ToastController, AnimationController } from '@ionic/angular';
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

  ngOnInit() { }

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
