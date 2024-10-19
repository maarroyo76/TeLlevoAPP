import { Component, OnInit } from '@angular/core';
import { LoginService } from 'src/app/services/login.service';
import { ModalController, ToastController, AnimationController } from '@ionic/angular';
import { Router } from '@angular/router';
import { RecoverModalComponent } from './recover-modal.component';
import { ConstantPool } from '@angular/compiler';

@Component({
  selector: 'app-recover',
  templateUrl: './recover.page.html',
  styleUrls: ['./recover.page.scss'],
})
export class RecoverPage implements OnInit {

  user = {
    id: '',
    username: '',
    name: '',
    lastname: ''
  };

  userId: string | null = null;

  constructor(
    private loginService: LoginService,
    private modalController: ModalController,
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
    return this.user.name.trim() !== '' &&
           this.user.lastname.trim() !== '' &&
           this.user.username.trim() !== '';
  }

  findUser() {
    if (this.isFormValid()) {
      this.loginService.findUser(this.user.username, this.user.name, this.user.lastname).subscribe((users) => {
        if (users.length > 0) {
          this.user.id = users[0].id.toString(); 
          this.openModal();
        } else {
          this.showToastMessage('Usuario no encontrado', 'warning');
        }
      });
    } else {
      this.showToastMessage('Todos los campos son requeridos', 'danger');
    }
  }

  async openModal() {
    const modal = await this.modalController.create({
        component: RecoverModalComponent,
        componentProps: {
            userId: this.user.id
        }
    });
    await modal.present();

    const { data, role } = await modal.onDidDismiss(); // Aquí obtienes el rol

    console.log('Rol recibido del modal:', role); // Asegúrate de ver qué rol recibes

    if (role === 'confirm') {
        this.showToastMessage('Contraseña actualizada', 'success');
        this.clear();
        this.router.navigate(['/log-in']);
    } else {
        console.log('Modal cerrado sin confirmar');
    }
  }



  clear() {
    this.user.username = '';
    this.user.name = '';
    this.user.lastname = '';
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
