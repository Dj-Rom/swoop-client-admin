import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DishTableGroup } from './dish-table-group';

describe('DishTableGroup', () => {
  let component: DishTableGroup;
  let fixture: ComponentFixture<DishTableGroup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DishTableGroup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DishTableGroup);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
