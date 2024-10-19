import { Component } from "@angular/core";
import { ModalController, ToastController } from "@ionic/angular";
import { LoginService } from "src/app/services/login.service";
import { NavParams } from "@ionic/angular";

@Component({
    selector: "app-recover-modal",
    templateUrl: "./recover-modal.component.html",
    styleUrls: ["./recover-modal.component.scss"]
})

export class RecoverModalComponent {

    newPassword!: string;
    confirmPassword!: string;

    userId!: string;
    name!: string;

    constructor(
        private modalCtrl: ModalController,
        private loginService: LoginService,
        private toastCtrl: ToastController,
        private navParams: NavParams
    ) { }

    ngOnInit() {
        this.getUser();
        this.userId = this.navParams.get('userId');
    }

    validateForm(): boolean {
        if (!this.newPassword || !this.confirmPassword) {
            this.presentToast('Por favor, rellene todos los campos', 'danger');
            return false;
        }
        return true;
    }
    
    validatePassword(): boolean {
        if (!this.validateForm()) return false; // Detener aquí si no pasa la validación
        if (this.newPassword !== this.confirmPassword) {
            this.presentToast('Las contraseñas no coinciden', 'danger');
            return false; 
        }
        return true;
    }

    recoverPassword() {
        if (!this.validatePassword()) return; // Detener aquí si no pasa la validación
        const userId = parseInt(this.userId);
        this.loginService.changePassword(userId, this.newPassword).subscribe(
            async () => {
                this.confirm();
            },
            async () => await this.presentToast('Error al actualizar la contraseña', 'danger')
        );
    }

    cancel() {
        return this.modalCtrl.dismiss(null, 'cancel');
    }

    confirm() {
        this.clearFields();
        return this.modalCtrl.dismiss(null, 'confirm'); // Asegúrate de pasar el rol correcto
    }

    getUser() {
        this.loginService.getUserById(parseInt(this.userId)).subscribe(
            user => {
                this.name = user.name;
            }
        );
    }

    clearFields() {
        this.newPassword = '';
        this.confirmPassword = '';
    }

    async presentToast(message: string, color: string) {
        const toast = await this.toastCtrl.create({
            message,
            color,
            duration: 2000
        });
        await toast.present();
    }

}