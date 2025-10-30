import { AuthService } from './servicios/seguridad/acceso/auth/auth.service';
import { AfterViewInit, Component, EventEmitter, OnInit, Renderer2 } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { FooterComponent } from './componentes/diseno/footer/footer/footer.component';
import { ContadorComponent } from './componentes/diseno/contador/contador.component';
import { AngularImports } from '../angular.imports';
import { HeaderComponent } from './componentes/diseno/header/header/header.component';
import { CommonModule } from '@angular/common';
import { SpinnerComponent } from './componentes/diseno/loading/spinner/spinner.component';
import { TranslateService } from '@ngx-translate/core';
import { PrimeNG } from 'primeng/config';

@Component({
  selector: 'app-root',
  standalone: true, // Asegúrate de que sea standalone si estás usando imports
  imports: [RouterOutlet, CommonModule, FooterComponent, HeaderComponent, SpinnerComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  title = 'SIGDD';
  showHeaderFooter: boolean = false;
  isLoadingPage: boolean = true; // 👈 nuevo estado de carga
  headerReadyToRender: boolean = false;


  constructor(
    private router: Router,
    private renderer: Renderer2,
    private authService: AuthService,
    private config: PrimeNG, // Usa PrimeNGConfig en lugar de PrimeNG
    private translate: TranslateService,
  ) {
    // Configura el idioma predeterminado
    this.translate.setDefaultLang('es');
  }

  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const isAuthenticated = this.authService.isAuthenticated();
        const url = event.url;

        const newShowHeaderFooter = isAuthenticated && !['/login', '/sin-acceso', '/panel', '/ticket/registrar', '/ticket/consultar'].includes(url);
        if (this.showHeaderFooter !== newShowHeaderFooter) {
          this.showHeaderFooter = newShowHeaderFooter;
        }
      });

    // Carga las traducciones y configura PrimeNG
    this.loadTranslations();
  }

  loadTranslations() {
    //console.log('Iniciando carga de traducciones');
    this.translate.use('es').subscribe(
      () => {
        //console.log('Idioma establecido a español');
        this.translate.get('primeng').subscribe(
          res => {
            //console.log('Traducciones obtenidas:', res);
            this.config.setTranslation(res);
            //console.log('Traducciones configuradas en PrimeNG');
          },
          //error => console.error('Error al obtener traducciones:', error)
        );
      },
      // error => console.error('Error al establecer idioma:', error)
    );
  }


  onChildComponentActivated(componentRef: any) {
    this.isLoadingPage = true;
    this.headerReadyToRender = false;

    if (componentRef.loadingCompleted instanceof EventEmitter) {
      componentRef.loadingCompleted.subscribe(() => {
        this.isLoadingPage = false;
        this.headerReadyToRender = true;
      });
    } else {
      this.isLoadingPage = false;
      this.headerReadyToRender = true;
    }
  }
}