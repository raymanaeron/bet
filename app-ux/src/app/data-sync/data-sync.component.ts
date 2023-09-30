import { Component, OnInit, OnDestroy, AfterViewChecked, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { AppService } from '../app.service';
import { GameRowData } from '../data-models/GameRowData';
import { BehaviorSubject, Observable } from 'rxjs';
import { UniqueGameData } from '../data-models/UniqueGameData';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-data-sync',
  templateUrl: './data-sync.component.html',
  styleUrls: ['./data-sync.component.scss']
})
export class DataSyncComponent implements OnInit, OnDestroy {

  private _lines = new BehaviorSubject<string[]>([]);
  lines$: Observable<string[]> = this._lines.asObservable();
  private shouldScroll: boolean = true;
  currentLines = <any>[];
  currentIndex = 0;
  uniqueGameDataMap: { [key: string]: UniqueGameData } = {};
  uniqueGameDataArray: UniqueGameData[] = [];
  private subscription: Subscription;
  public count = 0;

  @ViewChild('scrollContainer') private scrollContainer: ElementRef;

  constructor(private appService: AppService, private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.subscription = interval(30000).subscribe(() => {
      this.startProcessing();
    });
  }

  ngOnDestroy() {
    // Important to unsubscribe to prevent memory leaks
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
    }
    // Reset the flag after scroll
    this.shouldScroll = false;
  }

  private scrollToBottom(): void {
    const container = this.scrollContainer.nativeElement;
    container.scrollTop = container.scrollHeight;
  }

  createUniqueGameArray(data: any) {
    data.forEach((gd: { id: string; commence_time: any; }) => {
      if (!this.uniqueGameDataMap[gd.id]) {
        this.uniqueGameDataMap[gd.id] = {
          id: gd.id,
          commence_time: gd.commence_time
        };
      }

      this.uniqueGameDataArray = Object.values(this.uniqueGameDataMap);
      console.log(this.uniqueGameDataArray);
    });
  }

  startProcessing() {
    this.clearContent();
    this.appService.getProFootballEntireGameData().subscribe({
      next: (data) => {
        let results = <any>data;
        console.log("input data:");
        console.log(JSON.stringify(results.data));

        // Create a list of unique games so that we can get the periodical data later
        this.createUniqueGameArray(results.data);
        this.appService.saveProFootballEntireGameData(JSON.stringify(results.data)).subscribe({
          next: (saveres) => {
            console.log("Save result: ");
            console.log(saveres);

            this.retriveEachGameData();
          },
          error: (saveerr) => {
            console.log("database error: ");
            console.log(saveerr);
          },
          complete: () => {

          }
        });
      },
      error: (err) => {

      },
      complete: () => {

      }
    });
  }

  // Retrives periodical game data for a given game 
  retriveEachGameData() {

    if (this.currentIndex < this.uniqueGameDataArray.length) {
      // const currentGame = this.gameData[this.currentIndex];
      const currentGame = this.uniqueGameDataArray[this.currentIndex];

      this.appService.getProFootballPeriodicalGameData(currentGame.id).subscribe({
        next: (pd: any) => {

          console.log("pd=>");
          console.log(pd.data);

          this.currentLines.push("Periodical game fetch done for " + currentGame.id);
          this._lines.next([...this.currentLines]);
          this.shouldScroll = true;

          // save the data
          this.appService.saveProFootballPeriodicalGameData(JSON.stringify(pd.data)).subscribe({
            next: (periodicalsaveresult) => {
              console.log(periodicalsaveresult);
            },
            error: (periodicalsaveerror) => {
              console.log(periodicalsaveerror);
            },
            complete: () => {
              this.currentLines.push("Saved periodical data for game id:" + currentGame.id);
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

  clearContent() {
    this._lines.next([]);
    this.currentLines = <any>[];
    this.currentIndex = 0;
    this.uniqueGameDataMap = {};
    this.uniqueGameDataArray = [];
    this.shouldScroll = true;
  }
}
