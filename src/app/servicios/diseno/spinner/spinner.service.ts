// Angular Core
import { Injectable } from '@angular/core';

// RxJS
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({
  providedIn: 'root'
})

export class SpinnerService {

  private loadingCount = 0;
  private hasShownForCurrentPage = false;
  private navigationTimeout: any;
  private isLoadingSubject = new BehaviorSubject<boolean>(false);

  isLoading$ = this.isLoadingSubject.asObservable();

  startNavigationSpinner() {
    this.hasShownForCurrentPage = false;
    this.loadingCount = 0;
    this.isLoadingSubject.next(true);

    // Temporizador para páginas ligeras (sin consultas)
    this.navigationTimeout = setTimeout(() => this.stopNavigationSpinner(), 100); // 3 segundos de espera, ajustable
  }

  stopNavigationSpinner() {
    clearTimeout(this.navigationTimeout); // Cancela el temporizador si hay consultas
    this.isLoadingSubject.next(false);
    this.hasShownForCurrentPage = true;
  }

  showLoader() {
    if (!this.hasShownForCurrentPage) {
      this.loadingCount++;
      this.isLoadingSubject.next(true);
    }
  }

  hideLoader() {
    if (this.loadingCount > 0) {
      this.loadingCount--;
      if (this.loadingCount === 0) {
        this.stopNavigationSpinner();
      }
    }
  }

  resetPageLoadState() {
    this.hasShownForCurrentPage = false;
  }

  hasShownSpinnerForCurrentPage(): boolean {
    return this.hasShownForCurrentPage;
  }

}