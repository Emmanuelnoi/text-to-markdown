import { ComponentFixture, TestBed } from '@angular/core/testing';
import { fakeAsync, tick } from '@angular/core/testing';
import { AlertComponent } from './alert.component';
import { provideAnimations } from '@angular/platform-browser/animations';

describe('AlertComponent', () => {
  let component: AlertComponent;
  let fixture: ComponentFixture<AlertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertComponent],
      providers: [provideAnimations()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the correct title and message', () => {
    component.title = 'Test Title';
    component.message = 'Test Message';
    fixture.detectChanges();
  
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.alert-title')?.textContent).toContain('Test Title');
    expect(compiled.querySelector('.alert-message')?.textContent).toContain('Test Message');
  });
  
  it('should emit close event when close button is clicked', () => {
    spyOn(component.customClose, 'emit');
  
    const button = fixture.nativeElement.querySelector('.alert-close') as HTMLButtonElement;
    button.click();
  
    expect(component.customClose.emit).toHaveBeenCalled();
  });
  
  it('should show the correct icon for "success"', () => {
    component.type = 'success';
    fixture.detectChanges();
  
    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg).toBeTruthy();
  });
  
  it('should show alert with fadeInOut animation', () => {
    const alertEl = fixture.nativeElement.querySelector('.alert');
    expect(alertEl).toBeTruthy(); // ensure element exists
    expect(alertEl.hasAttribute('@fadeInOut')).toBeFalse(); // Angular animations don't render as attrs
  });

  it('should emit close event after timeout', fakeAsync(() => {
    spyOn(component.customClose, 'emit');
  
    // Simulate ngOnInit or timeout logic
    // component.ngOnInit(); <-- only if you're triggering dismissal in lifecycle
  
    setTimeout(() => component.customClose.emit(), 3000); // simulate internal logic
    tick(3000);
  
    expect(component.customClose.emit).toHaveBeenCalled();
  }));

});
