import { Directive, ElementRef, EventEmitter, HostListener, Output, output } from "@angular/core";

@Directive({
  selector: '[clickOutside]',
  standalone: true
})
export class ClickOutsideDirective {
  @Output() clickOutside = new EventEmitter<void>();
  // clickOutside = output<EventEmitter>()

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event.target'])
  onClick(target: any) {
    const clickedInside = this.elementRef.nativeElement.contains(target);
    if (!clickedInside) {
      this.clickOutside.emit();
    }
  }
}
