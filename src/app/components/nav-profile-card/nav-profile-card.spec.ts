import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavProfileCard } from './nav-profile-card';

describe('NavProfileCard', () => {
  let component: NavProfileCard;
  let fixture: ComponentFixture<NavProfileCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavProfileCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavProfileCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
