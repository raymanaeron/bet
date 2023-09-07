import { Component, OnInit } from '@angular/core';
import { AppService } from '../app.service';
import { GameRowData } from '../data-models/GameRowData';
import { DataUtility } from '../app.data-mapper';

@Component({
  selector: 'app-local-data',
  templateUrl: './local-data.component.html',
  styleUrls: ['./local-data.component.scss']
})
export class LocalDataComponent  implements OnInit {

  localDataFolder: string;
  gameData: GameRowData[] = [];
  currentIndex = 0;
  
  constructor(private appService: AppService) {
  }

  ngOnInit(): void {
    
  }

  // Retrives the entire game data
  retriveEntireGameData() {
    this.appService.getProFootballEntireGameData().subscribe({
      next: (data) => {
        var results = <any>data;
        this.gameData = DataUtility.flattenGameData(results.data);

        this.retriveEachGameData();
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

  // Retrives periodical game data for a given game 
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
