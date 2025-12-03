import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MateriasService } from 'src/app/services/materias.service';
import { FacadeService } from 'src/app/services/facade.service';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';

@Component({
  selector: 'app-materia-screen',
  templateUrl: './materia-screen.component.html',
  styleUrls: ['./materia-screen.component.scss']
})
export class MateriaScreenComponent implements OnInit {

  materias: any[] = [];
  lista_materias_filtradas: any[] = [];
  public userRole: string = '';
  public isAdmin: boolean = false;
  public isMaestro: boolean = false;

  // Estado de búsqueda, ordenamiento y paginación (similar a maestros)
  searchTerm: string = '';
  sortField: string = '';
  sortOrder: 'asc' | 'desc' = 'asc';
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 1;
  paginatedData: any[] = [];
  public Math = Math;

  constructor(
    private materiasService: MateriasService,
    private router: Router,
    private dialog: MatDialog,
    private facadeService: FacadeService
  ) {}

  ngOnInit(): void {
    // Obtener el rol del usuario
    this.userRole = this.facadeService.getUserGroup();
    this.isAdmin = this.userRole === 'administrador';
    this.isMaestro = this.userRole === 'maestro';
    
    // Validar que solo admin y maestro puedan ver esta pantalla
    if (!this.isAdmin && !this.isMaestro) {
      alert('No tienes permisos para acceder a esta sección');
      this.router.navigate(['/home']);
      return;
    }
    
    this.obtenerMaterias();
  }

  obtenerMaterias(): void {
    this.materiasService.obtenerListaMaterias({ page_size: 1000 }).subscribe(
      (response) => {
        this.materias = Array.isArray(response) ? response : (response.results || []);
        this.lista_materias_filtradas = [...this.materias];
        this.updatePagination();
      },
      (error) => {
        console.error('Error al obtener materias:', error);
      }
    );
  }

  aplicarBusqueda(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (term === '') {
      this.lista_materias_filtradas = [...this.materias];
    } else {
      this.lista_materias_filtradas = this.materias.filter(m => {
        const nrc = (m.nrc || '').toString().toLowerCase();
        const nombre = (m.nombre || '').toLowerCase();
        const seccion = (m.seccion || '').toString().toLowerCase();
        const programa = (m.programa_educativo || '').toLowerCase();
        const profesor = (m.profesor_nombre || '').toLowerCase();
        return nrc.includes(term) || nombre.includes(term) || seccion.includes(term) || programa.includes(term) || profesor.includes(term);
      });
    }
    if (this.sortField) {
      this.aplicarOrdenamiento();
    }
    this.currentPage = 1;
    this.updatePagination();
  }

  ordenar(field: string): void {
    if (this.sortField === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortOrder = 'asc';
    }
    this.aplicarOrdenamiento();
    this.updatePagination();
  }

  private aplicarOrdenamiento(): void {
    this.lista_materias_filtradas.sort((a, b) => {
      let valorA: any;
      let valorB: any;
      switch (this.sortField) {
        case 'nrc':
          valorA = a.nrc;
          valorB = b.nrc;
          break;
        case 'nombre':
          valorA = (a.nombre || '').toLowerCase();
          valorB = (b.nombre || '').toLowerCase();
          break;
        case 'seccion':
          valorA = (a.seccion || '').toString().toLowerCase();
          valorB = (b.seccion || '').toString().toLowerCase();
          break;
        case 'programa_educativo':
          valorA = (a.programa_educativo || '').toLowerCase();
          valorB = (b.programa_educativo || '').toLowerCase();
          break;
        case 'profesor_nombre':
          valorA = (a.profesor_nombre || '').toLowerCase();
          valorB = (b.profesor_nombre || '').toLowerCase();
          break;
        default:
          return 0;
      }
      if (valorA < valorB) return this.sortOrder === 'asc' ? -1 : 1;
      if (valorA > valorB) return this.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }

  public getSortIcon(field: string): string {
    if (this.sortField !== field) return 'bi-arrow-down-up';
    return this.sortOrder === 'asc' ? 'bi-sort-up' : 'bi-sort-down';
  }

  private updatePagination(): void {
    this.totalPages = Math.ceil(this.lista_materias_filtradas.length / this.itemsPerPage) || 1;
    if (this.currentPage > this.totalPages) this.currentPage = 1;
    this.updatePaginatedData();
  }

  private updatePaginatedData(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedData = this.lista_materias_filtradas.slice(startIndex, endIndex);
  }

  public goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedData();
    }
  }

  public previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedData();
    }
  }

  public nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedData();
    }
  }

  public getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    if (this.totalPages <= maxPagesToShow) {
      for (let i = 1; i <= this.totalPages; i++) pages.push(i);
    } else {
      let startPage = Math.max(1, this.currentPage - 2);
      let endPage = Math.min(this.totalPages, this.currentPage + 2);
      if (this.currentPage <= 3) endPage = maxPagesToShow;
      else if (this.currentPage >= this.totalPages - 2) startPage = this.totalPages - maxPagesToShow + 1;
      for (let i = startPage; i <= endPage; i++) pages.push(i);
    }
    return pages;
  }

  agregarMateria(): void {
    // Solo el administrador puede agregar materias
    if (!this.isAdmin) {
      alert('Solo el administrador puede registrar materias');
      return;
    }
    this.router.navigate(['/registro-materia']);
  }

  editarMateria(materia: any): void {
    // Solo el administrador puede editar materias
    if (!this.isAdmin) {
      alert('Solo el administrador puede editar materias');
      return;
    }
    this.router.navigate(['/registro-materia', materia.id]);
  }

  eliminarMateria(id: number): void {
    // Solo el administrador puede eliminar materias
    if (!this.isAdmin) {
      alert('Solo el administrador puede eliminar materias');
      return;
    }
    
    const dialogRef = this.dialog.open(EliminarUserModalComponent, {
      data: { id: id, rol: "materia" },
      height: '288px',
      width: '328px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.isDelete) {
        alert('Materia eliminada correctamente');
        this.obtenerMaterias();
      }
    });
  }
}