import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AppConstants } from 'src/environments/app-constants';
import { DataUtility } from './app.data-mapper';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  //rootURL = 'api';
  rootURL = '';

  constructor(private http: HttpClient) {
    if (environment.production) {
      this.rootURL = '';
    }
  }

  getHello() {
    return this.http.get(this.rootURL + '/hello')
      .pipe(map(res => res));
  }

  getEcho(message: string) {
    return message;
  }

  getRandKey() {
    return this.http.get(this.rootURL + '/randkey').pipe(map(res => res));
  }

  getProFootballEntireGameData() {
    return this.http.get(this.rootURL + '/proentire').pipe(map(res => res));
  }

  getProFootballPeriodicalGameData(gameid: string) {
    return this.http.get(this.rootURL + '/properiodical?gameid=' + gameid).pipe(map(res => res));
  }

  getLocalFile(fileName: string) {
    return this.http.get(this.rootURL + '/jsonstore?filename=' + fileName).pipe(map(res => res));
  }

  writeLocalFile(fileName: string, content: string) {
    return this.http.post(this.rootURL + '/jsonstore?filename=' + fileName, { content }).pipe(map(res => res));
  }

  signout() {
    return this.http.get(this.rootURL + '/auth/signout')
      .pipe(map(res => res));
  }

  getAuthStatus() {
    var authenticated = false;
    if (AppConstants.userProfile != null) {
      authenticated = true;
    }
    return authenticated;
  }

  validateSocialUser(token: string, socialUserId: string) {
    return this.http.get(this.rootURL + '/socialuser?token=' + token + '&id=' + socialUserId)
      .pipe(map(res => res));
  }

  getValidationCode(userPhoneNumber: string) {
    var data = {
      'user_primary_phone': userPhoneNumber
    };
    return this.http.post(this.rootURL + '/validationcode', { data }).pipe(map(res => res));
  }

  validateCode(userPhoneNumber: string, code: string) {
    var data = {
      'user_primary_phone': userPhoneNumber,
      'code': code
    };
    return this.http.post(this.rootURL + '/validatecode', { data }).pipe(map(res => res));
  }

  createOrUpdateUserProfile(data: any) {
    return this.http.post(this.rootURL + '/userprofile', { data }).pipe(map(res => res));
  }

  getUserProfile() {
    return this.http.get(this.rootURL + '/userprofile')
      .pipe(map(res => res));
  }

  getAccountBalance() {
    return this.http.get(this.rootURL + '/balance')
      .pipe(map(res => res));
  }

  getUsers() {
    return this.http.get(this.rootURL + '/users')
      .pipe(map(res => res));
  }

  getUserByEmail(email: String) {
    return this.http.get(this.rootURL + '/userbyemail?email=' + email)
      .pipe(map(res => res));
  }
}