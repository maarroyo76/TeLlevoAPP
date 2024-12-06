import { Component, OnInit } from '@angular/core';
import { LoginService } from 'src/app/services/login.service';
import { ToastController, AnimationController } from '@ionic/angular';
import { Router } from '@angular/router';
import { map, Observable, switchMap } from 'rxjs';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  user = {
    id: 0,
    username: '',
    password: '',
    name: '',
    lastname: '',
    driver: false,
    email: '',
  };


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
    return this.user.username.trim() !== '' &&
           this.user.password.trim() !== '' &&
           this.user.name.trim() !== '' &&
           this.user.lastname.trim() !== '' &&
           this.user.email.trim() !== '';
  }

  private assignUserId(): Observable<number> {
    return this.loginService.getUsers().pipe(
      map(users => {
        return users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
      })
    );
  }

  register() {
    if (!this.isFormValid()) {
      this.showToastMessage('Todos los campos son requeridos', 'danger');
      return;
    }

    this.assignUserId().pipe(
      switchMap(newId => {
        this.user.id = newId.toString() as unknown as number;
        return this.loginService.createUser(this.user);
      })
    ).subscribe({
      next: () => {
        this.showToastMessage('Registro exitoso!', 'success');
        this.router.navigate(['/log-in']);
      },
      error: () => {
        this.showToastMessage('Error en el servidor', 'danger');
      }
    });
  }



  clearForm() {
    this.user.username = '';
    this.user.password = '';
    this.user.name = '';
    this.user.lastname = '';
    this.user.email = '';
    this.user.driver = false;
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
