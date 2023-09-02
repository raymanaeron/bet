import { Component, OnInit } from '@angular/core';
import { AppService } from '../app.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  json_data: any;
  constructor(private appService: AppService) {

  }

  ngOnInit() : void {
    this.appService.getProFootballData().subscribe({
      next: (data) => {
        console.log(data);
        this.json_data = data;
      },
      error: (error) => {
        console.log(error);
      },
      complete: () => {
        console.log("Pro football fetch done")
      }
    })

    /*
    this.appService.getRandKey().subscribe({
      next: (data) => {
        console.log(data);
      },
      error: (error) => {
        console.log(error);
      },
      complete: () => {
      }
    })
    */
  }
}
