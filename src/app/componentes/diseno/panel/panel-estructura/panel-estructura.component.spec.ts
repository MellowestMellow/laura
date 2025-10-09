import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelEstructuraComponent } from './panel-estructura.component';

describe('PanelEstructuraComponent', () => {
  let component: PanelEstructuraComponent;
  let fixture: ComponentFixture<PanelEstructuraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelEstructuraComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanelEstructuraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
