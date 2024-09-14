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
    const found = this.users.find(user => user.username === username && user.password === password);
    if (found !== undefined) {
      return found.password === password;
    }
    return false;
  }
  
  registerUser(username: string, password: string, name: string, lastname: string, email: string): boolean {
    const existingUser = this.users.find(user => user.username === username);
    if (existingUser) {
      return false; 
    }
    const newUser = new User(username, password, name, lastname, email);
    this.users.push(newUser);
    return true;
  }

  changePassword(username: string, newPassword: string): boolean {
    const user = this.users.find(user => user.username === username);
    if (user) {
      user.password = newPassword;
      return true;
    }
    return false;
  }
}
