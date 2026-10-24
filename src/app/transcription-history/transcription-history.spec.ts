import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TranscriptionHistory } from './transcription-history';

describe('TranscriptionHistory', () => {
  let component: TranscriptionHistory;
  let fixture: ComponentFixture<TranscriptionHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranscriptionHistory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TranscriptionHistory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
