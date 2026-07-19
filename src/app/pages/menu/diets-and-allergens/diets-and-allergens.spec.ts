import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DietsAndAllergens } from './diets-and-allergens';

describe('DietsAndAllergens', () => {
  let component: DietsAndAllergens;
  let fixture: ComponentFixture<DietsAndAllergens>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DietsAndAllergens]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DietsAndAllergens);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
