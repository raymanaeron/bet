import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { AppService } from '../app.service';
import { GameRowData } from '../data-models/GameRowData';
import { DataUtility } from '../app.data-mapper';
import { BehaviorSubject, Observable } from 'rxjs';
import { UniqueGameData } from '../data-models/UniqueGameData';

@Component({
  selector: 'app-local-data',
  templateUrl: './local-data.component.html',
  styleUrls: ['./local-data.component.scss']
})
export class LocalDataComponent implements OnInit {

  private _lines = new BehaviorSubject<string[]>([]);
  lines$: Observable<string[]> = this._lines.asObservable();
  private shouldScroll: boolean = true;

  @ViewChild('scrollContainer') private scrollContainer: ElementRef;

  localDataFolder: string;
  gameData: GameRowData[] = [];
  currentIndex = 0;
  uniqueGameDataMap: { [key: string]: UniqueGameData } = {};
  uniqueGameDataArray: UniqueGameData[] = [];

  constructor(private appService: AppService, private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {

  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
    }
    // Reset the flag after scroll
    this.shouldScroll = false;
  }

  startProcessing() {
    this.retriveEntireGameData();
    /*
    const currentLines = [];
    // Simulating asynchronous processing of 1000+ items
    for (let i = 1; i <= 1000; i++) {
      setTimeout(() => {
        currentLines.push(`Processing line ${i}`);
        this._lines.next([...currentLines]);
        this.shouldScroll = true;
      }, i * 50); // 50 ms delay for each line, adjust as necessary
    }*/
  }

  clearContent() {
    this._lines.next([]);
  }

  private scrollToBottom(): void {
    const container = this.scrollContainer.nativeElement;
    container.scrollTop = container.scrollHeight;
  }

  // Retrives the entire game data
  retriveEntireGameData() {

    this.appService.getProFootballEntireGameData().subscribe({
      next: (data) => {
        var results = <any>data;
        this.gameData = DataUtility.flattenGameData(results.data);

        this.gameData.forEach(gd => {
          if (!this.uniqueGameDataMap[gd.id]) {
            this.uniqueGameDataMap[gd.id] = {
              id: gd.id,
              commence_time: gd.commence_time
            };
          }

          this.uniqueGameDataArray = Object.values(this.uniqueGameDataMap);
        });

        this.appService.writeLocalFile("entiregame.json", results).subscribe({
          next: (dt) => {

          },
          error: (err) => {

          },
          complete: () => {

          }
        });

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

  currentLines = <any>[];

  // Retrives periodical game data for a given game 
  retriveEachGameData() {

    if (this.currentIndex < this.gameData.length) {
      // const currentGame = this.gameData[this.currentIndex];
      const currentGame = this.uniqueGameDataArray[this.currentIndex];

      this.appService.getProFootballPeriodicalGameData(currentGame.id).subscribe({
        next: (pd: any) => {
          this.appService.writeLocalFile(currentGame.id + ".json", pd).subscribe({
            next: (dt) => {
              this.currentLines.push("Periodical game fetch data retrived : " + currentGame.id);
              this._lines.next([...this.currentLines]);
            },
            error: (err) => {
              this.currentLines.push("Error retrieving periodical game data for " + currentGame.id + err);
              this._lines.next([...this.currentLines]);
            },
            complete: () => {
              this.currentLines.push("Periodical game fetch done for " + currentGame.id);
              this._lines.next([...this.currentLines]);
              this.shouldScroll = true;
            }
          });
        },
        error: (err) => {
          this.currentLines.push("Error in periodical game data fetch");
          this.currentLines.push(err);
          this._lines.next([...this.currentLines]);
        },
        complete: () => {
          this.currentLines.push("Periodical fetch done for game id:" + currentGame.id);
          this._lines.next([...this.currentLines]);
          this.shouldScroll = true;
        }
      });

      this.currentIndex++;

      setTimeout(() => {
        this.retriveEachGameData(); // recursive call
      }, 1000);
    }
  }
}
