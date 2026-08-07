import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectSignUp } from './select-sign-up';

describe('SelectSignUp', () => {
  let component: SelectSignUp;
  let fixture: ComponentFixture<SelectSignUp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectSignUp]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectSignUp);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
