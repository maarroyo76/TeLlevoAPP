import { Injectable } from '@angular/core';
import { User } from '../models/user';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private userKey = 'user';

  constructor(
    private http: HttpClient
 ) { }

  validateUser(username: string, password: string) {
    return this.http.get<User[]>('http://localhost:3000/users?username=' + username + '&password=' + password).pipe(
      tap(users => {
        if (users.length > 0) {
          localStorage.setItem(this.userKey, JSON.stringify(users[0])); // Guarda el primer usuario encontrado
        }
      })
    );
  }

  createUser(user: User) {
    return this.http.post<User>('http://localhost:3000/users', user);
  }

  isAuth(): boolean {
    const user = localStorage.getItem(this.userKey);
    return !!user;
  }

  getCurrentUser(): User | null {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }

  logOut(){
    localStorage.removeItem(this.userKey);
  }

  getUsers() {
    return this.http.get<User[]>('http://localhost:3000/users');
  }

  getUserById(id: number) {
    return this.http.get<User>('http://localhost:3000/users/' + id);
  }

  findUser(username: string, name: string, lastname: string) {
    return this.http.get<User[]>('http://localhost:3000/users?username=' + username + '&name=' + name + '&lastname=' + lastname);
  }

  changePassword(id: number, newPassword: string) {
    return this.http.patch<User>('http://localhost:3000/users/' + id, {password: newPassword});
  }
}
