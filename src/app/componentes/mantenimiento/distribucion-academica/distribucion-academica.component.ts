import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../servicios/seguridad/acceso/auth/auth.service';
import { PermisoService } from '../../../servicios/seguridad/acceso/permiso/permiso.service';
import { Router } from '@angular/router';
import { DistribucionAcademicaService } from '../../../servicios/mantenimiento/distribucion-academica/distribucion-academica.service';
import { AccordionModule } from 'primeng/accordion';
import { AngularImports } from '../../../../angular.imports';
import { PrimeNGImports } from '../../../../primeng.imports';
interface distribucion {
  idUsuario: number,
  carreras: string
}

interface distribucionGeneral {
  idUsuario: number,
  nombreCompleto: string,
  carreras: [{
      idTituloAcademico: number,
      nombreTituloAcademico: string
    }
  ]
}

@Component({
  selector: 'app-distribucion-academica',
  templateUrl: './distribucion-academica.component.html',
  styleUrl: './distribucion-academica.component.scss',
  //standalone: true,
  imports: [AccordionModule, AngularImports, PrimeNGImports],
  providers: [MessageService]
})

export class DistribucionAcademicaComponent {
  @Output() loadingCompleted = new EventEmitter<boolean>();

  nombreDocente: string = '';
  searchValue: string | undefined;

  cargaAcademica: distribucionGeneral[] = [];
  cargaPorDocente: any[] = [];
  rolesUsuario: any[] = [];
  docentes: any[] = [];
  carreras: any[] = [];

  permisoActualizar: boolean = false;
  permisoInsertar: boolean = false;
  permisoEliminar: boolean = false;

  loadingtable: boolean = false;
  loadingDialogGeneral: boolean = false;
  loadingDialogRegistrar: boolean = false;
  loadingDialogActualizar: boolean = false;
  loadingDialogEliminar: boolean = false;
  
  isLoadingRegistrar: boolean = false;
  isLoadingActualizar: boolean = false;
  isLoadingEliminar: boolean = false;

  visibleRegistrar: boolean = false;
  visibleModificar: boolean = false;
  visibleEliminar: boolean = false;

  //Declaracion de formulario registrar
  RegistrarForm = new FormGroup({
    idUsuario: new FormControl(null, [Validators.required]),
    carreras: new FormControl('', [Validators.required])
  });

  //Declaracion de formulario modificar
  ActualizarForm = new FormGroup({
    idUsuario: new FormControl(null, Validators.required),
    carreras: new FormControl('', [Validators.required])
  });

  EliminarForm = new FormGroup({
    idUsuario: new FormControl(null, Validators.required)
  });

  constructor(
    private messageService: MessageService,
    private srvDistribucionAcademica: DistribucionAcademicaService,
    private AuthService: AuthService,
    private PermisoService: PermisoService,
    private router: Router
  ) {

  }

  // ────────────────────────────────
  // Sección de Utilidades Generales
  // Permisos, Filtros, Diálogos y Manejo de Errores
  // ────────────────────────────────

  ngOnInit(): void {
    this.loadingtable = true;
    this.cargarDistribucion();
    this.obtenerPermisos();
  }

  applyFilterGlobal(event: Event, table: any) {
    const inputValue = (event.target as HTMLInputElement).value;
    table.filterGlobal(inputValue, 'contains');
  }

  obtenerPermisos(): void {
    const roles = this.AuthService.getRolesFromToken() ?? [];
    this.rolesUsuario = roles;
    const idObjeto = 47; // El carga que estás consultando

    console.log('Roles del usuario:', this.rolesUsuario);
    this.PermisoService.getPermiso({ idObjeto, roles }).subscribe(
      (permisos: any[]) => {
        if (permisos?.length > 0) {
          const permiso = permisos[0];
          console.log('Permiso recibido del servidor:', permiso);
          this.permisoActualizar = permiso.permisoActualizar && roles.some(r => [1, 2, 22].includes(r)); // Administradores
          this.permisoInsertar = permiso.permisoInsertar && roles.some(r => [1, 2, 22].includes(r)); // Administradores
          this.permisoEliminar = permiso.permisoEliminar && roles.some(r => [1, 2, 22].includes(r)); // Administradores
        }
      },
      (error) => {
        console.error('Error al obtener los permisos', error);
      }
    );
  }

  clear(table: any) {
    table.clear();
    this.searchValue = '';  // Limpiar el valor del campo de búsqueda
    table.filterGlobal('', 'contains');  // Limpiar el filtro global
  }

  showErrorMessage(message: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'Operación Fallida',
      detail: message,
      life: 3000
    });
  }

  // Métodos para mostrar los distintos diálogos (Registrar, Modificar, Distribución Academica)
  showDialog(dialogType: 'Registrar' | 'Modificar' | 'Eliminar'): void { 
    
    if (dialogType === 'Registrar') {
      this.loadingDialogRegistrar = true;
      this.cargarDocentesYCarreras();
    } else {
      this[`visible${dialogType}`] = true;
    }
  }

  regresarPanel() {
    this.router.navigate(['/ajuste/sistema']);
  }

  // ────────────────────────────────
  // Sección de Carga de Datos para Tablas
  // Manejo de carga, filtrado y errores
  // ────────────────────────────────

  //Funcion para traer la información de parametros
  cargarDistribucion(): void {
    this.srvDistribucionAcademica.getDistribucion().subscribe(
      (response: any[]) => {
        this.cargaAcademica = response;

        this.cargaAcademica.forEach((carga: any) => {
          try {
            if (typeof carga.carreras === 'string') {
              carga.carreras = JSON.parse(carga.carreras);
            }

            const nombresCarreras = carga.carreras.map((c: any) => c.nombreTituloAcademico);

            this.cargaPorDocente[carga.idUsuario] = nombresCarreras;

            carga.carrerasTexto = nombresCarreras.join(' ').toLowerCase();

          } catch (error) {
            console.error('Error al parsear las carreras por docente', carga, error);
            this.cargaPorDocente[carga.idUsuario] = [];
          }
        });
        this.loadingtable = false; // Datos cargados con éxito
        this.loadingCompleted.emit(true);
        console.log(this.cargaAcademica);
      },
      (error) => {
        this.loadingtable = false;  // Detener el estado de carga
        this.showErrorMessage(error);  // Mostrar mensaje de error (puedes mejorar la visualización)
        this.loadingCompleted.emit(true);
      }
    );
  }

  cargarDatos(carga: any, tipo: 'Modificar' | 'Eliminar'): void {
    this.loadingDialogGeneral = true;

    this.nombreDocente = carga.nombreCompleto;

    if (tipo === 'Modificar') {
      this.ActualizarForm.patchValue({
        idUsuario: carga.idUsuario,
        carreras: carga.carreras.idTituloAcademico
      });
      this.visibleModificar = true;
    } else {
      this.visibleEliminar = true;
      this.EliminarForm.patchValue({
        idUsuario: carga.idUsuario
      }); 
    }

    // Simulación de carga
    setTimeout(() => {
      this.loadingDialogGeneral = false;
      this.loadingDialogActualizar = false;

      setTimeout(() => {
        this.showDialog(tipo);
      }, 0);
    }, 300);
  }

  cargarDocentesYCarreras(): void {
    this.srvDistribucionAcademica.getDocentes().subscribe(
      (response: any[]) => { 
        this.docentes = response;
        console.log(this.docentes);
      },
      (error) => {
        this.loadingDialogRegistrar = false;
        this.showErrorMessage(error);  // Mostrar mensaje de error (puedes mejorar la visualización)
        this.loadingCompleted.emit(true);
      }
    );

    this.srvDistribucionAcademica.getTitulos().subscribe(
      (response: any[]) => { 
        this.carreras = response; 
        console.log(this.carreras);

        this.loadingDialogRegistrar = false;
        this.visibleRegistrar = true;
      },
      (error) => {
        this.loadingDialogRegistrar = false;
        this.showErrorMessage(error);  // Mostrar mensaje de error (puedes mejorar la visualización)
        this.loadingCompleted.emit(true);
      }
    );  

  }
  // ────────────────────────────────
  // Sección de Funciones para Integración con Servicios Backend (APIs)
  // Inserts y Actualizacion 
  // ────────────────────────────────

  registrarDistribucion() {
    this.isLoadingRegistrar = true;
    //const formdata = this.RegistrarForm.value;
    const distribucion: distribucion[] = [{
      idUsuario: Number(this.RegistrarForm.value.idUsuario),
      carreras: String(this.RegistrarForm.value.carreras)
    }];

    // Llamar al servicio para insertar usuario y persona
    this.srvDistribucionAcademica.postDistribucion(distribucion).subscribe(
      (res: any) => {
        //this.cargarcargas();
        this.RegistrarForm.reset();
        this.visibleRegistrar = false;
        this.isLoadingRegistrar = false;

        // Mostrar mensaje de éxito
        this.messageService.add({
          severity: 'success',
          summary: 'Operación Exitosa',
          detail: res.message || 'Rol registrado exitosamente',
          life: 3000
        });
      },
      (error: any) => {
        this.isLoadingRegistrar = false;
        // Mostrar mensaje de error
        const msg = error.error?.mensaje || 'Error al registrar el carga';
        this.messageService.add({
          severity: 'error',
          summary: 'Operación Fallida',
          detail: msg,
          life: 3000
        });
      }
    );
  }

  actualizarDistribucion() {
    this.isLoadingActualizar = true;
    //const formdata = this.ActualizarForm.value;
    const distribucion: distribucion[] = [{
      idUsuario: Number(this.RegistrarForm.value.idUsuario),
      carreras: String(this.RegistrarForm.value.carreras)
    }];
    // Llamar al servicio para insertar usuario y persona
    this.srvDistribucionAcademica.putDistribucion(distribucion).subscribe(
      (res: any) => {
        //this.cargarcargas();
        this.ActualizarForm.reset();
        this.visibleModificar = false;
        this.isLoadingActualizar = false;

        // Mostrar mensaje de éxito
        this.messageService.add({
          severity: 'success',
          summary: 'Operación Exitosa',
          detail: res.message || 'Rol actualizado exitosamente',
          life: 3000
        });
      },
      (error: any) => {
        this.isLoadingActualizar = false;
        // Mostrar mensaje de error
        const msg = error.error?.mensaje || 'Error al actualizar el carga';
        this.messageService.add({
          severity: 'error',
          summary: 'Operación Fallida',
          detail: msg,
          life: 3000
        });
      }
    );
  }

}

