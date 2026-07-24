import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemPreview } from './item-preview';

describe('ItemPreview', () => {
  let component: ItemPreview;
  let fixture: ComponentFixture<ItemPreview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemPreview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItemPreview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
