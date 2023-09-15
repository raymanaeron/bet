import { Component, OnInit } from '@angular/core';
import { DataUtility } from '../app.data-mapper';
import { AppService } from '../app.service';
import { BehaviorSubject } from 'rxjs';

// required for date pipe
import { CommonModule } from '@angular/common';
import { GameRowData } from '../data-models/GameRowData';
import { UniqueGameData } from '../data-models/UniqueGameData';

@Component({
  selector: 'app-card-view',
  templateUrl: './card-view.component.html',
  styleUrls: ['./card-view.component.scss']
})
export class CardViewComponent implements OnInit {
  gameData: GameRowData[] = [];
  currentIndex = 0;
  uniqueGameDataMap: { [key: string]: UniqueGameData } = {};
  uniqueGameDataArray: UniqueGameData[] = [];
  
  constructor(private appService: AppService) {
   
  }

  dumptoconsole() {
    console.log(this.gameData);
  }

  ngOnInit(): void {
      this.appService.getLocalFile("entiregame.json").subscribe({
      next: (data) => {
        var results = <any>data;
        this.gameData = DataUtility.flattenGameData(JSON.parse(results.data));
        this.gameData.forEach(gd => {
          if (!this.uniqueGameDataMap[gd.id]) {
            this.uniqueGameDataMap[gd.id] = {
              id: gd.id,
              commence_time: gd.commence_time
            };
          }
          
          this.uniqueGameDataArray = Object.values(this.uniqueGameDataMap);
        });

        this.retriveEachGameData();
      },
      error: (error) => {
        console.log("Error in entire game data fetch");
        console.log(error);
      },
      complete: () => {
        console.log("Entire game fetch done");
        console.log(this.gameData);
      }
    });
  }

  retriveEachGameData() {
    if (this.currentIndex < this.uniqueGameDataArray.length) {
      //const currentGame = this.gameData[this.currentIndex];
      const currentGame = this.uniqueGameDataArray[this.currentIndex];

      this.appService.getLocalFile(currentGame.id + ".json").subscribe({
        next: (pd) => {
          var ld = <any>pd;

          // the util expects and array so create one and add our currentitem into it
          var ldarr = [];
          ldarr.push(JSON.parse(ld.data));

          var dt = DataUtility.flattenGameData(ldarr);
          
          dt.forEach(o=> {
            this.gameData.push(o);
          })
        },
        error: (err) => {
          console.log("Error in periodical game data fetch");
          console.log(err);
        },
        complete: () => {
          console.log("Periodical fetch done for game id:" + currentGame.id +  ", length: "+this.gameData.length);
        }
      });

      this.currentIndex++;

      setTimeout(() => {
        this.retriveEachGameData(); // recursive call
      }, 100);
    }
  }
}
