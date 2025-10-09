import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {

  private currentHeader = new BehaviorSubject<string>('Inicio');
  public header$ = this.currentHeader.asObservable();

  setHeader(nuevoTitulo: string): void {
    if (this.currentHeader.value !== nuevoTitulo) {
      this.currentHeader.next(nuevoTitulo);
    }
  }
}
