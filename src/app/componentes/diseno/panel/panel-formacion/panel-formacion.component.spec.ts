import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelFormacionComponent } from './panel-formacion.component';

describe('PanelFormacionComponent', () => {
  let component: PanelFormacionComponent;
  let fixture: ComponentFixture<PanelFormacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelFormacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanelFormacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
