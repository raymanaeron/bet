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
  currentIndex = 0;

  constructor(private appService: AppService) {
  }

  ngOnInit(): void {
      this.appService.getLocalFile("entiregame.json").subscribe({
      next: (data) => {
        var results = <any>data;
        this.gameData = DataUtility.flattenGameData(JSON.parse(results.data));
        // this.retriveEachGameData();
      },
      error: (error) => {
        console.log("Error in entire game data fetch");
        console.log(error);
      },
      complete: () => {
        console.log("Entire game fetch done")
      }
    });
  }

  retriveEachGameData() {
    if (this.currentIndex < this.gameData.length) {
      const currentGame = this.gameData[this.currentIndex];

      this.appService.getProFootballPeriodicalGameData(currentGame.id).subscribe({
        next: (pd) => {
          console.log(pd);
        },
        error: (err) => {
          console.log("Error in periodical game data fetch");
          console.log(err);
        },
        complete: () => {
          console.log("Periodical fetch done for game id:" + currentGame.id);
        }
      });

      this.currentIndex++;

      setTimeout(() => {
        this.retriveEachGameData(); // recursive call
      }, 1000);
    }
  }
}
