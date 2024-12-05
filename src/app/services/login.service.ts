import { Injectable } from '@angular/core';
import { User } from '../models/user';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private userKey = 'user';
  private currentUser: User | null = null;

  private apiURL = 'https://tellevo-server.onrender.com/users';

  constructor(
    private http: HttpClient,
    private storage: Storage
  ) {
    this.init();
  }

  async init() {
    await this.storage.create();
  }

  validateUser(username: string, password: string) {
    return this.http.get<User[]>(`${this.apiURL}?username=${username}&password=${password}`).pipe(
      tap(async users => {
        if (users.length > 0) {
          await this.storage.set(this.userKey, users[0]);
          this.currentUser = users[0];
        }
      })
    );
  }

  createUser(user: User) {
    return this.http.post<User>(this.apiURL, user);
  }

  async isAuth(): Promise<boolean> {
    const user = await this.storage.get(this.userKey);
    return !!user;
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const user = await this.storage.get(this.userKey);
      return user ? user : null;
    } catch (error) {
      console.error('Error al obtener el usuario:', error);
      return null;
    }
  }

  async logOut() {
    await this.storage.remove(this.userKey);
    this.currentUser = null;
  }

  getUsers() {
    return this.http.get<User[]>(this.apiURL);
  }

  getUserById(id: number) {
    return this.http.get<User>(`${this.apiURL}/${id}`);
  }

  findUser(username: string, name: string, lastname: string) {
    return this.http.get<User[]>(`${this.apiURL}?username=${username}&name=${name}&lastname=${lastname}`);
  }

  changePassword(id: number, newPassword: string) {
    return this.http.patch<User>(`${this.apiURL}/${id}`, { password: newPassword });
  }

  updateUser(id: number, user: User) {
    return this.http.put<User>(`${this.apiURL}/${id}`, user);
  }

  async updateStorage(user: any): Promise<void> {
    await this.storage.set(this.userKey, user);
    this.currentUser = user;
  }
}
