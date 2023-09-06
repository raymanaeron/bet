import { Component, OnInit } from '@angular/core';
import { DataUtility } from '../app.data-mapper';
import { AppService } from '../app.service';

// required for date pipe
import { CommonModule } from '@angular/common';
import { GameRowData } from '../data-models/GameRowData';

@Component({
  selector: 'app-card-view',
  templateUrl: './card-view.component.html',
  styleUrls: ['./card-view.component.scss']
})
export class CardViewComponent implements OnInit{
  gameData: GameRowData[] = [];

  constructor(private appService: AppService) {
  }

  ngOnInit(): void {
    this.appService.getProFootballEntireGameData().subscribe({
      next: (data) => {
        var results = <any>data;
        this.gameData = DataUtility.flattenGameData(results.data);
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
