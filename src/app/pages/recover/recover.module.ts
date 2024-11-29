import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RecoverPageRoutingModule } from './recover-routing.module';
import { RecoverPage } from './recover.page';
import { RecoverModalComponent } from './recover-modal.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    RecoverPageRoutingModule
  ],
  declarations: [RecoverPage, RecoverModalComponent],
})
export class RecoverPageModule {}
