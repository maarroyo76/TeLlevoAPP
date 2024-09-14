export class User {
    username: string;
    password: string;
    name: string;
    lastname: string;
    email: string;

    constructor(u: string, p: string, n: string = '', l: string = '', e: string = '') {
        this.username = u;
        this.password = p;
        this.name = n;
        this.lastname = l;
        this.email = e;
    }
}
