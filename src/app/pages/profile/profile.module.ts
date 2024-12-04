import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { ProfilePageRoutingModule } from './profile-routing.module';
import { FormsModule } from '@angular/forms';

import { ProfilePage } from './profile.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule,
    ProfilePageRoutingModule,
  ],
  declarations: [ProfilePage]
})
export class ProfilePageModule {}
