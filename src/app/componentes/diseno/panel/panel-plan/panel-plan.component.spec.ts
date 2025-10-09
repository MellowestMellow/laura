import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelPlanComponent } from './panel-plan.component';

describe('PanelPlanComponent', () => {
  let component: PanelPlanComponent;
  let fixture: ComponentFixture<PanelPlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelPlanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanelPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
