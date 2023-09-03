import { Component, Input } from '@angular/core';
import { FlattenedDisplayData } from '../data-models/FlattenedDisplayData'; // Adjust the path

@Component({
  selector: 'app-betting-card',
  templateUrl: './betting-card.component.html',
  styleUrls: ['./betting-card.component.scss']
})
export class BettingCardComponent {
  @Input() data: FlattenedDisplayData;

  placeBet() {
    // Implement the behavior for placing a bet
  }
}