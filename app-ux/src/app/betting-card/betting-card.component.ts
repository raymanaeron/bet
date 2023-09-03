import { Component, Input } from '@angular/core';
import { FlattenedData } from '../data-models/FlattenedData'; // Adjust the path

@Component({
  selector: 'app-betting-card',
  templateUrl: './betting-card.component.html',
  styleUrls: ['./betting-card.component.scss']
})
export class BettingCardComponent {
  @Input() betOption: FlattenedData;

  placeBet() {
    // Implement the behavior for placing a bet
  }
}