import { Component, OnInit } from '@angular/core';
import { AppService } from '../app.service';
import { Odd } from '../data-models/odds';
import { DataUtility } from '../app.data-mapper';
import { InputData } from '../data-models/InputData';
import { FlattenedData } from '../data-models/FlattenedData';

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
    this.appService.getProFootballData().subscribe({
      next: (data) => {
        var results = <any>data;
        this.table_data = [];
        results.data.forEach((d: InputData) => {
          var rows = DataUtility.flattenData(d);
          rows.forEach((r:any) => {
            this.table_data.push(r);
          })
        });
      },
      error: (error) => {
        console.log(error);
      },
      complete: () => {
        console.log("Pro football fetch done")
      }
    })

    function getFirstItem(dataArray: InputData[]): InputData | null {
      if (dataArray && dataArray.length > 0) {
        return dataArray[0];
      }
      return null;  // or return undefined, based on your preference
    }
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
