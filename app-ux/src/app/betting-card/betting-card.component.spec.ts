import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BettingCardComponent } from './betting-card.component';

describe('BettingCardComponent', () => {
  let component: BettingCardComponent;
  let fixture: ComponentFixture<BettingCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BettingCardComponent]
    });
    fixture = TestBed.createComponent(BettingCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
