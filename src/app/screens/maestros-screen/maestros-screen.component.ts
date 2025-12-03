import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';
import { FacadeService } from 'src/app/services/facade.service';
import { MaestrosService } from 'src/app/services/maestros.service';

@Component({
  selector: 'app-maestros-screen',
  templateUrl: './maestros-screen.component.html',
  styleUrls: ['./maestros-screen.component.scss']
})

export class MaestrosScreenComponent implements OnInit {

  public name_user: string = "";
  public rol: string = "";
  public token: string = "";
  public lista_maestros: any[] = [];
  public lista_maestros_filtrados: any[] = [];
  
  // Variables para búsqueda y filtros
  public searchTerm: string = "";
  public sortField: string = "";
  public sortOrder: 'asc' | 'desc' = 'asc';
  
  // Variables para paginación
  public currentPage: number = 1;
  public itemsPerPage: number = 5;
  public totalPages: number = 1;
  public paginatedData: any[] = [];
  
  // Hacer Math disponible en el template
  public Math = Math;

  // Roles y permisos
  public userRole: string = '';
  public isAdmin: boolean = false;
  public isMaestro: boolean = false;

  constructor(
    public facadeService: FacadeService,
    public maestrosService: MaestrosService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = this.facadeService.getUserGroup();
    
    // Obtener rol del usuario
    this.userRole = this.facadeService.getUserGroup();
    this.isAdmin = this.userRole === 'administrador';
    this.isMaestro = this.userRole === 'maestro';
    
    //Validar que haya inicio de sesión
    //Obtengo el token del login
    this.token = this.facadeService.getSessionToken();
    console.log("Token: ", this.token);
    if(this.token == ""){
      this.router.navigate(["/"]);
    }
    //Obtener maestros
    this.obtenerMaestros();
  }

  // Consumimos el servicio para obtener los maestros
  //Obtener maestros
  public obtenerMaestros() {
    this.maestrosService.obtenerListaMaestros().subscribe(
      (response) => {
        this.lista_maestros = response;
        this.lista_maestros_filtrados = [...response];
        this.updatePagination();
        console.log("Lista maestros: ", this.lista_maestros);
      }, (error) => {
        console.error("Error al obtener la lista de maestros: ", error);
        alert("No se pudo obtener la lista de maestros");
      }
    );
  }

  // Función para buscar
  public buscar() {
    const term = this.searchTerm.toLowerCase().trim();
    
    if (term === "") {
      this.lista_maestros_filtrados = [...this.lista_maestros];
    } else {
      this.lista_maestros_filtrados = this.lista_maestros.filter(maestro => {
        const id = maestro.id?.toString().toLowerCase() || "";
        const nombre = `${maestro.user.first_name} ${maestro.user.last_name}`.toLowerCase();
        const email = maestro.user.email?.toLowerCase() || "";
        const idTrabajador = maestro.id_trabajador?.toLowerCase() || "";
        const rfc = maestro.rfc?.toLowerCase() || "";
        
        return id.includes(term) || 
               nombre.includes(term) || 
               email.includes(term) || 
               idTrabajador.includes(term) ||
               rfc.includes(term);
      });
    }
    
    if (this.sortField) {
      this.aplicarOrdenamiento();
    }
    
    this.currentPage = 1;
    this.updatePagination();
  }

  // Función para ordenar
  public ordenar(field: string) {
    if (this.sortField === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortOrder = 'asc';
    }
    
    this.aplicarOrdenamiento();
    this.updatePagination();
  }

  // ordenamiento
  private aplicarOrdenamiento() {
    this.lista_maestros_filtrados.sort((a, b) => {
      let valorA: any;
      let valorB: any;
      
      switch(this.sortField) {
        case 'id':
          valorA = a.id;
          valorB = b.id;
          break;
        case 'nombre':
          valorA = `${a.user.first_name} ${a.user.last_name}`.toLowerCase();
          valorB = `${b.user.first_name} ${b.user.last_name}`.toLowerCase();
          break;
        case 'id_trabajador':
          valorA = a.id_trabajador?.toLowerCase() || "";
          valorB = b.id_trabajador?.toLowerCase() || "";
          break;
        default:
          return 0;
      }
      
      if (valorA < valorB) {
        return this.sortOrder === 'asc' ? -1 : 1;
      }
      if (valorA > valorB) {
        return this.sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  // Obtener icono de ordenamiento
  public getSortIcon(field: string): string {
    if (this.sortField !== field) {
      return 'bi-arrow-down-up';
    }
    return this.sortOrder === 'asc' ? 'bi-sort-up' : 'bi-sort-down';
  }

  // Actualizar paginación
  private updatePagination() {
    this.totalPages = Math.ceil(this.lista_maestros_filtrados.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
    this.updatePaginatedData();
  }

  // Actualizar datos paginados
  private updatePaginatedData() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedData = this.lista_maestros_filtrados.slice(startIndex, endIndex);
  }

  // Ir a página específica
  public goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedData();
    }
  }

  // Página anterior
  public previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedData();
    }
  }

  // Página siguiente
  public nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedData();
    }
  }

  // Obtener array de números de página
  public getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    
    if (this.totalPages <= maxPagesToShow) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, this.currentPage - 2);
      let endPage = Math.min(this.totalPages, this.currentPage + 2);
      
      if (this.currentPage <= 3) {
        endPage = maxPagesToShow;
      } else if (this.currentPage >= this.totalPages - 2) {
        startPage = this.totalPages - maxPagesToShow + 1;
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }

  // Cambiar elementos por página
  public changeItemsPerPage(items: number) {
    this.itemsPerPage = items;
    this.currentPage = 1;
    this.updatePagination();
  }

  public goEditar(idUser: number) {
    // Solo administradores pueden editar
    if (!this.isAdmin) {
      alert("No tienes permisos para editar maestros.");
      return;
    }
    this.router.navigate(["registro-usuarios/maestros/" + idUser]);
  }

  public delete(idUser: number) {
    // Solo administradores pueden eliminar
    if (!this.isAdmin) {
      alert("No tienes permisos para eliminar maestros.");
      return;
    }

    const dialogRef = this.dialog.open(EliminarUserModalComponent, {
      data: { id: idUser, rol: 'maestro' },
      height: '288px',
      width: '328px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.isDelete) {
        console.log("Maestro eliminado");
        alert("Maestro eliminado correctamente.");
        this.obtenerMaestros();
      } else {
        console.log("No se eliminó el maestro");
      }
    });
  }

}
