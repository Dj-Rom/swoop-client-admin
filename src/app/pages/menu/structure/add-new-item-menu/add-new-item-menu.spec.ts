import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewItemMenu } from './add-new-item-menu';

describe('AddNewItemMenu', () => {
  let component: AddNewItemMenu;
  let fixture: ComponentFixture<AddNewItemMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddNewItemMenu]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddNewItemMenu);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
