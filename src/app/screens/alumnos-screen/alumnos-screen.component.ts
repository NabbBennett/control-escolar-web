import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';
import { AlumnosService } from 'src/app/services/alumnos.service';
import { FacadeService } from 'src/app/services/facade.service';

@Component({
  selector: 'app-alumnos-screen',
  templateUrl: './alumnos-screen.component.html',
  styleUrls: ['./alumnos-screen.component.scss']
})
export class AlumnosScreenComponent implements OnInit {
  // Variables del componente
  public name_user: string = "";
  public lista_alumnos: any[] = [];
  public lista_alumnos_filtrados: any[] = [];
  
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
    private alumnosService: AlumnosService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();
    
    // Obtener rol del usuario
    this.userRole = this.facadeService.getUserGroup();
    this.isAdmin = this.userRole === 'administrador';
    this.isMaestro = this.userRole === 'maestro';
    this.obtenerAlumnos();
  }

  // Obtener lista de alumnos
  public obtenerAlumnos() {
    this.alumnosService.obtenerListaAlumnos().subscribe(
      (response) => {
        this.lista_alumnos = response;
        this.lista_alumnos_filtrados = [...response];
        this.updatePagination();
        console.log("Lista alumnos: ", this.lista_alumnos);
      }, (error) => {
        alert("No se pudo obtener la lista de alumnos");
      }
    );
  }

  // Función para buscar
  public buscar() {
    const term = this.searchTerm.toLowerCase().trim();
    
    if (term === "") {
      this.lista_alumnos_filtrados = [...this.lista_alumnos];
    } else {
      this.lista_alumnos_filtrados = this.lista_alumnos.filter(alumno => {
        const id = alumno.id?.toString().toLowerCase() || "";
        const nombre = `${alumno.user.first_name} ${alumno.user.last_name}`.toLowerCase();
        const email = alumno.user.email?.toLowerCase() || "";
        const matricula = alumno.matricula?.toLowerCase() || "";
        const curp = alumno.curp?.toLowerCase() || "";
        
        return id.includes(term) || 
               nombre.includes(term) || 
               email.includes(term) || 
               matricula.includes(term) ||
               curp.includes(term);
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

  // Aplicar ordenamiento
  private aplicarOrdenamiento() {
    this.lista_alumnos_filtrados.sort((a, b) => {
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
        case 'matricula':
          valorA = a.matricula?.toLowerCase() || "";
          valorB = b.matricula?.toLowerCase() || "";
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
    this.totalPages = Math.ceil(this.lista_alumnos_filtrados.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
    this.updatePaginatedData();
  }

  // Actualizar datos paginados
  private updatePaginatedData() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedData = this.lista_alumnos_filtrados.slice(startIndex, endIndex);
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
    // Solo administradores y maestros pueden editar
    if (!this.isAdmin && !this.isMaestro) {
      alert("No tienes permisos para editar alumnos.");
      return;
    }
    this.router.navigate(["registro-usuarios/alumno/" + idUser]);
  }

  public delete(idUser: number) {
    // Solo administradores y maestros pueden eliminar
    if (!this.isAdmin && !this.isMaestro) {
      alert("No tienes permisos para eliminar alumnos.");
      return;
    }

    const dialogRef = this.dialog.open(EliminarUserModalComponent, {
      data: { id: idUser, rol: 'alumno' },
      height: '288px',
      width: '328px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.isDelete) {
        console.log("Alumno eliminado");
        alert("Alumno eliminado correctamente.");
        this.obtenerAlumnos();
      } else {
        console.log("No se eliminó el alumno");
      }
    });
  }
}
