import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appCapitalizable]'
})
export class CapitalizableDirective {

  constructor(private ngControl: NgControl) { }

  private capitalizeFirstWord(value: string): string {
    const trimmed = value.trimStart();
    if (!trimmed) return value;

    const firstWordMatch = trimmed.match(/^(\S+)(.*)$/);
    if (!firstWordMatch) return value;

    const [_, firstWord, rest] = firstWordMatch;

    // No modificamos si la primera palabra ya está toda en mayúsculas (siglas)
    if (firstWord === firstWord.toUpperCase()) {
      return firstWord + rest;
    }

    const capitalizedFirstWord =
      firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();

    return capitalizedFirstWord + rest;
  }

  @HostListener('input', ['$event.target.value'])
  onInput(value: string) {
    if (typeof value !== 'string') return;

    const capitalized = this.capitalizeFirstWord(value);

    if (value !== capitalized) {
      this.ngControl.control?.setValue(capitalized, { emitEvent: false });
    }
  }
}
