import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelReservacionComponent } from './panel-reservacion.component';

describe('PanelReservacionComponent', () => {
  let component: PanelReservacionComponent;
  let fixture: ComponentFixture<PanelReservacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelReservacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanelReservacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
