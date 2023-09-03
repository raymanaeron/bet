import { Component, OnInit } from '@angular/core';
import { DataUtility } from '../app.data-mapper';
import { AppService } from '../app.service';
import { FlattenedDisplayData } from '../data-models/FlattenedDisplayData';

// required for date pipe
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card-view',
  templateUrl: './card-view.component.html',
  styleUrls: ['./card-view.component.scss']
})
export class CardViewComponent implements OnInit{
  table_data: any[];
  flattenedData: FlattenedDisplayData[] = [];

  constructor(private appService: AppService) {
  }

  ngOnInit(): void {
    this.appService.getProFootballData().subscribe({
      next: (data) => {
        var results = <any>data;
        this.flattenedData = DataUtility.flattenInputData(results.data);
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
