import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MateriasService } from 'src/app/services/materias.service';
import { MaestrosService } from 'src/app/services/maestros.service';
import { FacadeService } from 'src/app/services/facade.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-registo-materia-screen',
  templateUrl: './registo-materia-screen.component.html',
  styleUrls: ['./registo-materia-screen.component.scss']
})
export class RegistoMateriaScreenComponent implements OnInit {

  formMateria!: FormGroup;
  maestros: any[] = [];
  errors: any = {};
  modoEdicion: boolean = false;
  idMateria: number = 0;

  diasSemana: string[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  diasSeleccionados: string[] = [];

  programasEducativos: string[] = [
    'Ingeniería en Ciencias de la Computación',
    'Licenciatura en Ciencias de la Computación',
    'Ingeniería en Tecnologías de la Información'
  ];

  constructor(
    private fb: FormBuilder,
    private materiasService: MateriasService,
    private maestrosService: MaestrosService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private facadeService: FacadeService
  ) {}

  ngOnInit(): void {
    // Validar que solo el administrador pueda acceder a esta pantalla
    const userRole = this.facadeService.getUserGroup();
    if (userRole !== 'administrador') {
      alert('Solo el administrador puede registrar o editar materias');
      this.router.navigate(['/materias']);
      return;
    }

    this.initForm();
    this.obtenerMaestros();

    // Verificar si viene ID por parámetro para edición
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.idMateria = +params['id'];
        this.modoEdicion = true;
        this.cargarMateria(this.idMateria);
      }
    });
  }

  initForm(): void {
    this.formMateria = this.fb.group({
      nrc: ['', Validators.required],
      nombre: ['', Validators.required],
      seccion: ['', Validators.required],
      dias: [[], Validators.required],
      hora_inicio: ['', Validators.required],
      hora_fin: ['', Validators.required],
      salon: ['', Validators.required],
      programa_educativo: ['', Validators.required],
      profesor_id: ['', Validators.required],
      creditos: ['', [Validators.required, Validators.min(1)]]
    });
  }

  cargarMateria(id: number): void {
    this.materiasService.obtenerMateriaPorID(id).subscribe(
      (materia) => {
        this.cargarDatosMateria(materia);
      },
      (error) => {
        console.error('Error al cargar materia:', error);
        alert('Error al cargar la materia');
        this.regresar();
      }
    );
  }

  cargarDatosMateria(materia: any): void {
    this.diasSeleccionados = Array.isArray(materia.dias) ? [...materia.dias] : [];
    
    this.formMateria.patchValue({
      nrc: materia.nrc,
      nombre: materia.nombre,
      seccion: materia.seccion,
      dias: this.diasSeleccionados,
      hora_inicio: materia.hora_inicio,
      hora_fin: materia.hora_fin,
      salon: materia.salon,
      programa_educativo: materia.programa_educativo,
      profesor_id: materia.profesor_id,
      creditos: materia.creditos
    });
  }

  obtenerMaestros(): void {
    this.maestrosService.obtenerListaMaestros().subscribe(
      (response) => {
        this.maestros = response;
      },
      (error) => {
        console.error('Error al obtener maestros:', error);
      }
    );
  }

  // Métodos de input para filtrar caracteres
  onNrcInput(event: any): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '');
    this.formMateria.patchValue({ nrc: input.value });
  }

  onNombreInput(event: any): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    this.formMateria.patchValue({ nombre: input.value });
  }

  onSeccionInput(event: any): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '');
    this.formMateria.patchValue({ seccion: input.value });
  }

  onSalonInput(event: any): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^a-zA-Z0-9\s]/g, '');
    this.formMateria.patchValue({ salon: input.value });
  }

  onCreditosInput(event: any): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '');
    this.formMateria.patchValue({ creditos: input.value });
  }

  onDiaChange(event: any): void {
    const dia = event.target.value;
    if (event.target.checked) {
      if (!this.diasSeleccionados.includes(dia)) {
        this.diasSeleccionados.push(dia);
      }
    } else {
      const index = this.diasSeleccionados.indexOf(dia);
      if (index > -1) {
        this.diasSeleccionados.splice(index, 1);
      }
    }
    this.formMateria.patchValue({ dias: this.diasSeleccionados });
  }

  guardarMateria(): void {
    this.errors = {};
    const materiaData = this.formMateria.value;
    
    // Validar
    this.errors = this.materiasService.validarMateria(materiaData, this.modoEdicion);
    
    if (Object.keys(this.errors).length === 0) {
      if (this.modoEdicion) {
        // Actualizar materia
        const dataUpdate = {
          id: this.idMateria,
          ...materiaData
        };
        
        this.materiasService.actualizarMateria(dataUpdate).subscribe(
          (response) => {
            alert('Materia actualizada correctamente');
            this.router.navigate(['/materias']);
          },
          (error) => {
            console.error('Error al actualizar materia:', error);
            alert('Error al actualizar la materia');
          }
        );
      } else {
        // Verificar NRC único antes de registrar
        this.materiasService.verificarNRCUnico(materiaData.nrc).subscribe(
          (response) => {
            if (response.existe) {
              this.errors['nrc'] = 'Este NRC ya está registrado';
            } else {
              // Registrar nueva materia
              this.materiasService.registrarMateria(materiaData).subscribe(
                (response) => {
                  alert('Materia registrada correctamente');
                  this.router.navigate(['/materias']);
                },
                (error) => {
                  console.error('Error al registrar materia:', error);
                  alert('Error al registrar la materia');
                }
              );
            }
          },
          (error) => {
            console.error('Error al verificar NRC:', error);
          }
        );
      }
    } else {
      alert('Por favor, complete todos los campos obligatorios correctamente');
    }
  }

  regresar(): void {
    this.router.navigate(['/materias']);
  }

  // Función para regresar a la pantalla anterior
  public goBack(): void {
    this.location.back();
  }
}
