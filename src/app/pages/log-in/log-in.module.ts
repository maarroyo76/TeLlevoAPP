import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { LogInPageRoutingModule } from './log-in-routing.module';
import { LogInPage } from './log-in.page';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    LogInPageRoutingModule
  ],
  declarations: [LogInPage]
})
export class LogInPageModule {}
