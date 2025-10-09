import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsuarioInternoComponent } from './usuario-interno.component';

describe('UsuarioInternoComponent', () => {
  let component: UsuarioInternoComponent;
  let fixture: ComponentFixture<UsuarioInternoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuarioInternoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsuarioInternoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
