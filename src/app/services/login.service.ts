import { Injectable } from '@angular/core';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  users: User[] = [
    new User('admin', '12345'),
    new User('User', '11235'),
    new User('Martin', '223344')
  ];

  constructor() { }

  validateLogin(username: string, password: string): boolean {
    console.log("Ejecutando validacion SERVICE!")
    const found = this.users.find(user => user.username === username && user.password === password);
    if (found !== undefined) {
      console.log("Usuario encontrado!")
      return found.password === password;
    }
    console.log("Usuario no encontrado!")
    return false;
  }
}
