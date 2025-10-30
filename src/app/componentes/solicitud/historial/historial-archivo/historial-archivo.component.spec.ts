import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialArchivoComponent } from './historial-archivo.component';

describe('HistorialArchivoComponent', () => {
  let component: HistorialArchivoComponent;
  let fixture: ComponentFixture<HistorialArchivoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorialArchivoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistorialArchivoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
