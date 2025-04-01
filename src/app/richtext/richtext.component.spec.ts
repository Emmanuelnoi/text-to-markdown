import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RichtextComponent } from './richtext.component';

describe('MenuComponent', () => {
  let component: RichtextComponent;
  let fixture: ComponentFixture<RichtextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RichtextComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RichtextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
