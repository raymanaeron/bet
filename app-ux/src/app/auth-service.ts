import { Injectable, Inject, PLATFORM_ID, } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AppConstants } from 'src/environments/app-constants';
import { Router } from '@angular/router';
import { isPlatformServer } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private redirectUrl: string = '/';
    private rootURL = '/api';

    constructor(private router: Router, private http: HttpClient, @Inject(PLATFORM_ID) private platformId: any) {
        if (environment.production) {
            this.rootURL = '';
        }
    }

    public setRedirectUrl(url: string) {
        this.redirectUrl = url;
    }

    public isAuthenticated(): Observable<boolean> {
        return this.http.get<any>(this.rootURL + '/auth/loggedin').pipe(map(response => response.authenticated));
    }

    public signIn(token: string): Observable<any> {
        return this.http.get<any>(this.rootURL + '/auth/signin?token=' + token).pipe(map(res => res));
    }

    public signOut() {
        return this.http.get<any>(this.rootURL + '/auth/signout').pipe(map(res => res));
    }

}