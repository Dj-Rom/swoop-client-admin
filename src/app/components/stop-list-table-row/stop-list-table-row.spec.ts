import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StopListTableRow } from './stop-list-table-row';

describe('StopListTableRow', () => {
  let component: StopListTableRow;
  let fixture: ComponentFixture<StopListTableRow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StopListTableRow]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StopListTableRow);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
