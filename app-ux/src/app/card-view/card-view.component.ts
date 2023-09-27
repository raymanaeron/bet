import { Component, OnInit } from '@angular/core';
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
    this.appService.getProFootballGameData().subscribe({
      next: (data) => {
        this.gameData = <any>data;
      }, 
      error: (error) => {
        console.log("Error retrieving game data from sql server");
        console.log(error);
      },
      complete: () => {
        console.log("Game data fetch done");
      }
    });

  }
}
