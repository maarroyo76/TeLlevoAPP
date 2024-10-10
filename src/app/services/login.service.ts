import { Injectable } from '@angular/core';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  users: User[] = [
    new User('admin', 'admin12345'),
  ];

  constructor() { }

  validateLogin(username: string, password: string): boolean {
    const found = this.users.find(user => user.username === username && user.password === password);
    if (found !== undefined) {
      localStorage.setItem('user', JSON.stringify(found));
      return found.password === password;
    }
    return false;
  }

  isAuth(): boolean {
    const user = localStorage.getItem('user');
    return !!user;
  }

  logOut(){
    localStorage.removeItem('user');
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
