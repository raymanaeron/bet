import { Component, OnInit } from '@angular/core';
import { AppService } from '../app.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  constructor(private appService: AppService) {

  }

  ngOnInit() : void {
    this.appService.getIdKey().subscribe({
      next: (data) => {
        console.log(data);
      },
      error: (error) => {

      },
      complete: () => {
        console.log("done");
      }
    })
  }
}
