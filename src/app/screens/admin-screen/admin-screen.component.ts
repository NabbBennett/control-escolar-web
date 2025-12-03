import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';
import { AdministradoresService } from 'src/app/services/administradores.service';
import { FacadeService } from 'src/app/services/facade.service';

@Component({
  selector: 'app-admin-screen',
  templateUrl: './admin-screen.component.html',
  styleUrls: ['./admin-screen.component.scss']
})
export class AdminScreenComponent implements OnInit {
  // métodos 
  public name_user: string = "";
  public lista_admins: any[] = [];
  public lista_admins_filtrados: any[] = [];
  
  // búsqueda y filtros
  public searchTerm: string = "";
  public sortField: string = "";
  public sortOrder: 'asc' | 'desc' = 'asc';
  
  // paginación
  public currentPage: number = 1;
  public itemsPerPage: number = 5;
  public totalPages: number = 1;
  public paginatedData: any[] = [];
  
  // Hacer Math disponible en el template
  public Math = Math;

  constructor(
    public facadeService: FacadeService,
    private administradoresService: AdministradoresService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();

    // Obtenemos los administradores
    this.obtenerAdmins();
  }

  //lista de usuarios
  public obtenerAdmins() {
    this.administradoresService.obtenerListaAdmins().subscribe(
      (response) => {
        this.lista_admins = response;
        this.lista_admins_filtrados = [...response];
        this.updatePagination();
        console.log("Lista users: ", this.lista_admins);
      }, (error) => {
        alert("No se pudo obtener la lista de administradores");
      }
    );
  }

  // Función para buscar
  public buscar() {
    const term = this.searchTerm.toLowerCase().trim();
    
    if (term === "") {
      this.lista_admins_filtrados = [...this.lista_admins];
    } else {
      this.lista_admins_filtrados = this.lista_admins.filter(admin => {
        const id = admin.id?.toString().toLowerCase() || "";
        const nombre = `${admin.user.first_name} ${admin.user.last_name}`.toLowerCase();
        const email = admin.user.email?.toLowerCase() || "";
        const rfc = admin.rfc?.toLowerCase() || "";
        
        return id.includes(term) || 
               nombre.includes(term) || 
               email.includes(term) || 
               rfc.includes(term);
      });
    }
    
    //ordenamiento 
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
    this.lista_admins_filtrados.sort((a, b) => {
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

  // icono de ordenamiento XD si va arriba o abajo
  public getSortIcon(field: string): string {
    if (this.sortField !== field) {
      return 'bi-arrow-down-up';
    }
    return this.sortOrder === 'asc' ? 'bi-sort-up' : 'bi-sort-down';
  }

  // Actualizar paginación
  private updatePagination() {
    this.totalPages = Math.ceil(this.lista_admins_filtrados.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
    this.updatePaginatedData();
  }

  // Actualizar datos paginados
  private updatePaginatedData() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedData = this.lista_admins_filtrados.slice(startIndex, endIndex);
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

  // Obtener array de números de página para mostrar
  public getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    
    if (this.totalPages <= maxPagesToShow) {
      // Mostrar todas las páginas
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Mostrar páginas alrededor de la actual
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
    this.router.navigate(["registro-usuarios/administrador/" + idUser]);
  }

  public delete(idUser: number) {
    const dialogRef = this.dialog.open(EliminarUserModalComponent, {
      data: { id: idUser, rol: 'administrador' },
      height: '288px',
      width: '328px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.isDelete) {
        console.log("Administrador eliminado");
        alert("Administrador eliminado correctamente.");
        this.obtenerAdmins();
      } else {
        console.log("No se eliminó el administrador");
      }
    });
  }

}
