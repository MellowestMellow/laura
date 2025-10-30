import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DistribucionAcademicaComponent } from './distribucion-academica.component';

describe('DistribucionAcademicaComponent', () => {
  let component: DistribucionAcademicaComponent;
  let fixture: ComponentFixture<DistribucionAcademicaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DistribucionAcademicaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DistribucionAcademicaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
