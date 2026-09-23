import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeedFormComponent } from './seed-form.component';

describe('SeedFormComponent', () => {
  let component: SeedFormComponent;
  let fixture: ComponentFixture<SeedFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeedFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SeedFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
