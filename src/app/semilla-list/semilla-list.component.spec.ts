import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SemillaListComponent } from './semilla-list.component';

describe('SemillaListComponent', () => {
  let component: SemillaListComponent;
  let fixture: ComponentFixture<SemillaListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SemillaListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SemillaListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
