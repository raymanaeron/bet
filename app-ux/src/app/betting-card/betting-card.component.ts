import { Component, Input } from '@angular/core';
import { GameRowData } from '../data-models/GameRowData';

@Component({
  selector: 'app-betting-card',
  templateUrl: './betting-card.component.html',
  styleUrls: ['./betting-card.component.scss']
})
export class BettingCardComponent {
  @Input() data: GameRowData;

  placeBet() {
    // Implement the behavior for placing a bet
  }
}