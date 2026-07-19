import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StructureHeader } from './structure-header';

describe('StructureHeader', () => {
  let component: StructureHeader;
  let fixture: ComponentFixture<StructureHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StructureHeader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StructureHeader);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
