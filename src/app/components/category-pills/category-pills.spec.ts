import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryPills } from './category-pills';

describe('CategoryPills', () => {
  let component: CategoryPills;
  let fixture: ComponentFixture<CategoryPills>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryPills]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoryPills);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
