import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AjusteUsuarioComponent } from './ajuste-usuario.component';

describe('AjusteUsuarioComponent', () => {
  let component: AjusteUsuarioComponent;
  let fixture: ComponentFixture<AjusteUsuarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AjusteUsuarioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AjusteUsuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
