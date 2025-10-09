import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelSeguridadComponent } from './panel-seguridad.component';

describe('PanelSeguridadComponent', () => {
  let component: PanelSeguridadComponent;
  let fixture: ComponentFixture<PanelSeguridadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelSeguridadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanelSeguridadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
