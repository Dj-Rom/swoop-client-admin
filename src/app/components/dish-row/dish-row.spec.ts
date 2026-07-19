import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DishRow } from './dish-row';

describe('DishRow', () => {
  let component: DishRow;
  let fixture: ComponentFixture<DishRow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DishRow]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DishRow);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
