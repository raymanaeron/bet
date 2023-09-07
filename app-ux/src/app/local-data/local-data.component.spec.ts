import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocalDataComponent } from './local-data.component';

describe('LocalDataComponent', () => {
  let component: LocalDataComponent;
  let fixture: ComponentFixture<LocalDataComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LocalDataComponent]
    });
    fixture = TestBed.createComponent(LocalDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
