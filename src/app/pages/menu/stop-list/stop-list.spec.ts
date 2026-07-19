import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StopList } from './stop-list';

describe('StopList', () => {
  let component: StopList;
  let fixture: ComponentFixture<StopList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StopList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StopList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
