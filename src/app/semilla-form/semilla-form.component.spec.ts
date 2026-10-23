import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SemillaFormComponent } from './semilla-form.component';

describe('SemillaFormComponent', () => {
  let component: SemillaFormComponent;
  let fixture: ComponentFixture<SemillaFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SemillaFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SemillaFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
