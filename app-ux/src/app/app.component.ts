import { Component } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
//import { AuthService } from './auth-service';
//import { LocalStorageService } from './local-storage-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'BetApp';
  loggedIn = false;
  userName = "default";
  accountBalance = 0.00;

  signIn(): void {

  }

  signOut(): void {
    
  }
}
