import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuTabs } from './menu-tabs';

describe('MenuTabs', () => {
  let component: MenuTabs;
  let fixture: ComponentFixture<MenuTabs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuTabs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuTabs);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
