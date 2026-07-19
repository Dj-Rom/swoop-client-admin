import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarNavigation } from './sidebar-navigation';
import { RouterLink } from '@angular/router';

describe('SidebarNavigation', () => {
  let component: SidebarNavigation;
  let fixture: ComponentFixture<SidebarNavigation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarNavigation, RouterLink],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarNavigation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
