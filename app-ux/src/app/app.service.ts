import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AppService {
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

  getProFootballGameData() {
    return this.http.get(this.rootURL + '/gamedata').pipe(map(res => res));
  }

  saveProFootballEntireGameData(data: any) {
    return this.http.post(this.rootURL + '/entiregamedata', { data }).pipe(map(res => res));
  }

  saveProFootballPeriodicalGameData(data: any) {
    return this.http.post(this.rootURL + '/periodicalgamedata', { data }).pipe(map(res => res));
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
}