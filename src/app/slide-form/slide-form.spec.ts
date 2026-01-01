import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlideForm } from './slide-form';

describe('SlideFormComponent', () => {
  let component: SlideForm;
  let fixture: ComponentFixture<SlideForm>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlideForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SlideForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
