import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DishTable } from './dish-table';

describe('DishTable', () => {
  let component: DishTable;
  let fixture: ComponentFixture<DishTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DishTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DishTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
