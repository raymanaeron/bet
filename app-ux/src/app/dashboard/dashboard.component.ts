import { Component, OnInit } from '@angular/core';
import { AppService } from '../app.service';
import { DataUtility } from '../app.data-mapper';

// required for date pipe
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  table_data: any[];
  constructor(private appService: AppService) {
  }

  ngOnInit(): void {
    this.appService.getProFootballEntireGameData().subscribe({
      next: (data) => {
        var results = <any>data;
        /*
        var rows = DataUtility.flattenInputData(results.data);

        this.table_data = [];
        rows.forEach((r: any) => {
          this.table_data.push(r);
        });
        */
      },
      error: (error) => {
        console.log(error);
      },
      complete: () => {
        console.log("Pro football fetch done")
      }
    })
  }
}
