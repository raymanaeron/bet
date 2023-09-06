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
export class CardViewComponent implements OnInit {
  gameData: GameRowData[] = [];

  constructor(private appService: AppService) {
  }

  ngOnInit(): void {
    this.appService.getProFootballEntireGameData().subscribe({
      next: (data) => {
        var results = <any>data;
        this.gameData = DataUtility.flattenGameData(results.data);

        this.gameData.forEach((gd: any) => {
          this.appService.getProFootballPeriodicalGameData(gd.id).subscribe({
            next: (pd) => {
              console.log(pd);
            },
            error: (err) => {
              console.log("Error in periodical game data fetch");
              console.log(err);
            },
            complete: () => {
              console.log("Periodical fetch done for game id:" + gd.id);
            }
          });
        });
      },
      error: (error) => {
        console.log("Error in entire game data fetch");
        console.log(error);
      },
      complete: () => {
        console.log("Entire game fetch done")
      }
    })
  }
}
