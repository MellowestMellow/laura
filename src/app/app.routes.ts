import { Routes } from '@angular/router';
import { SinAccesoComponent } from './componentes/diseno/bloqueos/sin-acceso/sin-acceso.component';
import { AuthGuard, loginGuard } from '../../src/app/guards/auth/auth.guard'
import { ConstruccionComponent} from './componentes/diseno/bloqueos/construccion/construccion.component';
export const routes: Routes = [
  // Ruta raíz redirige al panel principal
  { path: '', redirectTo: 'panel', pathMatch: 'full' },

  // Panel principal del sistema 
  {
    path: 'panel',
    loadComponent: () =>
      import('./componentes/diseno/panel/panel/panel.component').then(
        (c) => c.PanelComponent
      ),
  },

  // Página de inicio de sesión
  {
    path: 'login',
    loadComponent: () =>
      import('./componentes/seguridad/cuenta/login/login.component').then(
        (c) => c.LoginComponent
      ),
    canActivate: [loginGuard]
  },
  
  // Página de prueba calendario
  {
    path: 'calendario',
    loadComponent: () =>
      import('./componentes/plan-operativo/calendario/calendario.component').then(
        (c) => c.CalendarioComponent
      ),

  },

  // Página  de Tickets
  {
    path: 'ticket',
    children: [
      // Consultar tickets existentes
      {
        path: 'consultar',
        loadComponent: () =>
          import(
            './componentes/solicitud/ticket/consultar-tickets/consultar-tickets.component'
          ).then((c) => c.ConsultarTicketsComponent),

      },
      // Registrar un nuevo ticket
      {
        path: 'registrar',
        loadComponent: () =>
          import(
            './componentes/solicitud/ticket/registro-tickets/registro-tickets.component'
          ).then((c) => c.RegistroTicketsComponent),

      },
    ],
  },

  // Menú Interno principal del sistema
  {
    path: 'menu',
    loadComponent: () =>
      import('./componentes/diseno/menu/menu/menu.component').then(
        (c) => c.MenuComponent
      ),
    canActivate: [AuthGuard], data: { pantallaId: 1 }
  },

  // Menú Externo principal del sistema
  {
    path: 'menu/externo',
    loadComponent: () =>
      import('./componentes/diseno/menu/menu-externo/menu-externo.component').then(
        (c) => c.MenuExternoComponent
      ),
    canActivate: [AuthGuard], data: { pantallaId: 1 }
  },


  // Módulo de Persona
  {
    path: 'persona',
    children: [
      // Administración de usuarios
      {
        path: 'perfil',
        loadComponent: () =>
          import(
            './componentes/seguridad/cuenta/perfil/perfil.component'
          ).then((c) => c.PerfilComponent),
        canActivate: [AuthGuard], data: { pantallaId: 2 }

      },
      // Registrar un nuevo ticket
      {
        path: 'notificacion',
        loadComponent: () =>
          import(
            './componentes/seguridad/cuenta/notificacion/notificacion.component'
          ).then((c) => c.NotificacionComponent),
        canActivate: [AuthGuard], data: { pantallaId: 3 }
      },
    ],
  },

  // Módulo de solicitudes
  {
    path: 'solicitud',
    children: [
      // Vista principal de solicitudes
      {
        path: '',
        loadComponent: () =>
          import(
            './componentes/solicitud/solicitud/solicitudes/solicitudes.component'
          ).then((c) => c.SolicitudesComponent),
        canActivate: [AuthGuard], data: { pantallaId: 4 }

      },
      // Vista de historial de solicitudes
      {
        path: 'historial',
        loadComponent: () =>
          import(
            './componentes/solicitud/historial/historial-solicitudes/historial-solicitudes.component'
          ).then((c) => c.HistorialSolicitudesComponent),
        canActivate: [AuthGuard], data: { pantallaId: 5 }

      },
      // Vista de solicitudes hechas por el usuario actual
      {
        path: 'usuario',
        loadComponent: () =>
          import(
            './componentes/solicitud/solicitud/mis-solicitudes/mis-solicitudes.component'
          ).then((c) => c.MisSolicitudesComponent),
        canActivate: [AuthGuard], data: { pantallaId: 7 }
      },
    ],
  },

  // Módulo de Asignaciones
  {
    path: 'asignacion',
    children: [
      // Asignaciones del usuario actual
      {
        path: 'usuario',
        loadComponent: () =>
          import(
            './componentes/asignacion/mis-asignaciones/mis-asignaciones.component'
          ).then((c) => c.MisAsignacionesComponent),
        canActivate: [AuthGuard], data: { pantallaId: 6 }

      },
    ],
  },

  // Módulo de seguridad
  {
    path: 'seguridad',
    children: [
      // Administración de usuarios
      {
        path: 'usuario',
        loadComponent: () =>
          import('./componentes/seguridad/usuario/usuario-interno/usuario-interno.component').then(
            (c) => c.UsuarioInternoComponent
          ),
        canActivate: [AuthGuard], data: { pantallaId: 9 }
      },
      {
        path: 'usuario/ticket',
        loadComponent: () =>
          import('./componentes/seguridad/usuario/usuario-ticket/usuario-ticket.component').then(
            (c) => c.UsuarioTicketComponent
          ),
        canActivate: [AuthGuard], data: { pantallaId: 10 }
      },
      // Administración de roles
      {
        path: 'rol',
        loadComponent: () =>
          import('./componentes/seguridad/acceso/rol/rol.component').then(
            (c) => c.RolComponent
          ),
        canActivate: [AuthGuard], data: { pantallaId: 11 }
      },
      // Administración de Parametros
      {
        path: 'parametro',
        loadComponent: () =>
          import('./componentes/seguridad/acceso/parametro/parametro.component').then(
            (c) => c.ParametroComponent
          ),
        canActivate: [AuthGuard], data: { pantallaId: 12 }
      },
      // Asignación de permisos a roles
      {
        path: 'permiso/:idRol',
        loadComponent: () =>
          import('./componentes/seguridad/acceso/permiso/permiso.component').then(
            (c) => c.PermisoComponent
          ),
        canActivate: [AuthGuard],
        data: {
          pantallaId: 13,
          renderMode: 'server' // 👈 Esto evita el error de prerender
        }
      },
      {
        path: 'bitacora',
        loadComponent: () =>
          import('./componentes/seguridad/acceso/bitacora/bitacora.component').then(
            (c) => c.BitacoraComponent
          ),
        canActivate: [AuthGuard], data: { pantallaId: 14 }
      },
      // Administración de objetos

    ],
  },

    // Componente para gestión de comisiones
  {
    path: 'calendario/academico',
    loadComponent: () =>
      import('./componentes/plan-operativo/calendario/calendario.component').then(
        (c) => c.CalendarioComponent
      ),
    canActivate: [AuthGuard], data: { pantallaId: 30 }
  },


  // Componente para gestión de comisiones
  {
    path: 'comision',
    loadComponent: () =>
      import('./componentes/comision/comision/comision.component').then(
        (c) => c.ComisionComponent
      ),
    canActivate: [AuthGuard], data: { pantallaId: 16 }
  },

  // Componente de formación o capacitaciones
  {
    path: 'formacion',
    loadComponent: () =>
      import(
        './componentes/formacion/formacion/formacion.component'
      ).then((c) => c.FormacionComponent),
    canActivate: [AuthGuard], data: { pantallaId: 17 }
  },

  // Módulo del plan operativo
  {
    path: 'plan',
    children: [
      // Vista general del plan operativo
      {
        path: 'operativo',
        loadComponent: () =>
          import(
            './componentes/plan-operativo/plan/plan.component'
          ).then((c) => c.PlanComponent),
        canActivate: [AuthGuard], data: { pantallaId: 18 }
      },
      // Vista general de estadisticas del personal
      {
        path: 'estadística',
        loadComponent: () =>
          import(
            './componentes/plan-operativo/estadisticas/estadisticas.component'
          ).then((c) => c.EstadisticasComponent),
        canActivate: [AuthGuard], data: { pantallaId: 19 }
      },
      // Asignaciones del usuario actual
      {
        path: 'estadística/personal',
        loadComponent: () =>
          import(
            './componentes/plan-operativo/estadistica-personal/estadistica-personal.component'
          ).then((c) => c.EstadisticaPersonalComponent),
        canActivate: [AuthGuard], data: { pantallaId: 19 }
      },
      // Asignaciones del usuario actual
    ],
  },

  // Componente de Reservacion
  {
    path: 'reservacion',
    loadComponent: () =>
      import(
        './componentes/reservacion/reservacion/reservacion.component'
      ).then((c) => c.ReservacionComponent),
    canActivate: [AuthGuard], data: { pantallaId: 20 }
  },

  // Módulo de mantenimiento (duplicación de ruta panel, revisar)
  {
    path: 'ajuste',
    children: [
      {
        path: 'sistema',
        loadComponent: () =>
          import('./componentes/diseno/ajustes/ajuste-sistema/ajuste-sistema.component').then(
            (c) => c.AjusteSistemaComponent
          ),
        canActivate: [AuthGuard], data: { pantallaId: 21 }
      },
      {
        path: 'usuario',
        loadComponent: () =>
          import('./componentes/diseno/ajustes/ajuste-usuario/ajuste-usuario.component').then(
            (c) => c.AjusteUsuarioComponent
          ),
        canActivate: [AuthGuard], data: { pantallaId: 22 }
      },
    ]

  },

  // Módulo de paneles de mantenimiento
  {
    path: 'panel',
    children: [
      {
        path: 'seguridad',
        loadComponent: () =>
          import('./componentes/diseno/panel/panel-seguridad/panel-seguridad.component').then(
            (c) => c.PanelSeguridadComponent
          ),
        canActivate: [AuthGuard], data: { pantallaId: 23 }
      },
      {
        path: 'estructura/academica',
        loadComponent: () =>
          import('./componentes/diseno/panel/panel-estructura/panel-estructura.component').then(
            (c) => c.PanelEstructuraComponent
          ),
        canActivate: [AuthGuard], data: { pantallaId: 24 }
      },
      {
        path: 'formacion',
        loadComponent: () =>
          import('./componentes/diseno/panel/panel-formacion/panel-formacion.component').then(
            (c) => c.PanelFormacionComponent
          ),
        canActivate: [AuthGuard], data: { pantallaId: 25 }
      },
      {
        path: 'reservacion',
        loadComponent: () =>
          import('./componentes/diseno/panel/panel-reservacion/panel-reservacion.component').then(
            (c) => c.PanelReservacionComponent
          ),
        canActivate: [AuthGuard], data: { pantallaId: 28 }
      },
    ]

  },

  {
    path: 'mantenimiento',
    children: [
      // Submódulo seguridad dentro de MANTENIMIENTO
      {
        path: 'seguridad',
        children: [
          {
            path: 'objeto',
            loadComponent: () =>
              import('./componentes/mantenimiento/seguridad/mantenimiento-objetos/mantenimiento-objetos.component').then(
                (c) => c.MantenimientoObjetosComponent
              ),
            canActivate: [AuthGuard],
            data: { pantallaId: 36 }
          },
          {
            path: 'tipo-notificacion',
            loadComponent: () =>
              import('./componentes/mantenimiento/seguridad/mantenimiento-tipo-notificacion/mantenimiento-tipo-notificacion.component').then(
                (c) => c.MantenimientoTipoNotificacionComponent
              ),
            canActivate: [AuthGuard],
            data: { pantallaId: 37 }
          },
        ]
      },

      // Submódulo solicitud dentro de MANTENIMIENTO
      {
        path: 'solicitud',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./componentes/mantenimiento/solicitud/mantenimiento-solicitud/mantenimiento-solicitud.component').then(
                (c) => c.MantenimientoSolicitudComponent
              ),
            canActivate: [AuthGuard],
            data: { pantallaId: 29 }
          },
        ]
      },
      // Submódulo Estructura Academica dentro de MANTENIMIENTO
      {
        path: 'estructura/academica',
        children: [
          {
            path: 'universidad',
            loadComponent: () =>
              import('./componentes/mantenimiento/estructura-academica/mantenimiento-universidad/mantenimiento-universidad.component').then(
                (c) => c.MantenimientoUniversidadComponent
              ),
            canActivate: [AuthGuard],
            data: { pantallaId: 38 }
          },
          {
            path: 'organizacion',
            loadComponent: () =>
              import('./componentes/mantenimiento/estructura-academica/mantenimiento-organizacion-academica/mantenimiento-organizacion-academica.component').then(
                (c) => c.MantenimientoOrganizacionAcademicaComponent
              ),
            canActivate: [AuthGuard],
            data: { pantallaId: 39 }
          },
          {
            path: 'departamento',
            loadComponent: () =>
              import('./componentes/mantenimiento/estructura-academica/mantenimiento-departamentos-academicos/mantenimiento-departamentos-academicos.component').then(
                (c) => c.MantenimientoDepartamentosAcademicosComponent
              ),
            canActivate: [AuthGuard],
            data: { pantallaId: 40 }
          },
          {
            path: 'facultad',
            loadComponent: () =>
              import('./componentes/mantenimiento/estructura-academica/mantenimiento-facultades-academicas/mantenimiento-facultades-academicas.component').then(
                (c) => c.MantenimientoFacultadesAcademicasComponent
              ),
            canActivate: [AuthGuard],
            data: { pantallaId: 41 }
          },
          {
            path: 'formacion',
            loadComponent: () =>
              import('./componentes/mantenimiento/estructura-academica/mantenimiento-formacion-academica/mantenimiento-formacion-academica.component').then(
                (c) => c.MantenimientoFormacionAcademicaComponent
              ),
            canActivate: [AuthGuard],
            data: { pantallaId: 42 }
          },
        ]
      },
          // Submódulo solicitud dentro de MANTENIMIENTO
      {
        path: 'formacion',
        children: [
          {
            path: 'estado',
            loadComponent: () =>
              import('./componentes/mantenimiento/formacion/mantenimiento-estado-formacion/mantenimiento-estado-formacion.component').then(
                (c) => c.MantenimientoEstadoFormacionComponent
              ),
            canActivate: [AuthGuard],
            data: { pantallaId: 43 }
          },
           {
            path: 'modalidad',
            loadComponent: () =>
              import('./componentes/mantenimiento/formacion/mantenimiento-modalidad-formacion/mantenimiento-modalidad-formacion.component').then(
                (c) => c.MantenimientoModalidadFormacionComponent
              ),
            canActivate: [AuthGuard],
            data: { pantallaId: 44 }
          },
        ]
      },

      // Submódulo carga académica dentro de MANTENIMIENTO
      {
        path: 'carga/academica',
        loadComponent: () =>
          import(
            './componentes/mantenimiento/distribucion-academica/distribucion-academica.component').then((c) => c.DistribucionAcademicaComponent),
            canActivate: [AuthGuard], data: { pantallaId: 47 }
      },
    ]
  },


  // Ruta para mostrar mensaje de acceso denegado
  { path: 'sin-acceso', component: SinAccesoComponent },

  // Ruta para mostrar mensaje de construccion
  {
    path: 'pagina/en/construccion', component: ConstruccionComponent
    , canActivate: [AuthGuard], data: { pantallaId: 1 }
  },

  // Ruta comodín para redireccionar cualquier ruta no válida
  { path: '**', redirectTo: '/persona/perfil', pathMatch: 'full' },
];
