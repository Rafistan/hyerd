import {
  Directive,
  ElementRef,
  Input,
  OnInit,
  OnDestroy,
  inject,
} from '@angular/core';

@Directive({
  selector: '[hyAnimate]',
  standalone: true,
})
export class ScrollAnimateDirective implements OnInit, OnDestroy {
  @Input('hyAnimate') animationType: string = '';
  @Input() hyDelay: number = 0;

  private el = inject(ElementRef);
  private observer!: IntersectionObserver;

  ngOnInit(): void {
    const nativeEl: HTMLElement = this.el.nativeElement;
    nativeEl.setAttribute('data-animate', this.animationType || 'up');

    if (this.hyDelay) {
      nativeEl.style.transitionDelay = `${this.hyDelay}ms`;
    }

    this.observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            nativeEl.classList.add('animated');
            this.observer.unobserve(nativeEl);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    this.observer.observe(nativeEl);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
