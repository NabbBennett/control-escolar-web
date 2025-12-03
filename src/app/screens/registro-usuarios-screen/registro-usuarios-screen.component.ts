import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { Location } from '@angular/common';
import { MatRadioChange } from '@angular/material/radio';
import { AdministradoresService } from '../../services/administradores.service';
import { MaestrosService } from '../../services/maestros.service';
import { AlumnosService } from '../../services/alumnos.service';

@Component({
  selector: 'app-registro-usuarios-screen',
  templateUrl: './registro-usuarios-screen.component.html',
  styleUrls: ['./registro-usuarios-screen.component.scss']
})
export class RegistroUsuariosScreenComponent implements OnInit {

  public tipo : string = "registro-usuarios";
  public user : any = {};
  public editar : boolean = false;
  public rol : string = "";
  public idUser : number = 0;

  //Banderas para el tipo de usuario
  public isAdmin:boolean = false;
  public isAlumno:boolean = false;
  public isMaestro:boolean = false;

  public tipo_user:string = "";

  constructor(
    private location : Location,
    public activatedRoute: ActivatedRoute,
    private router: Router,
    public facadeService: FacadeService,
    private administradoresService: AdministradoresService,
    private maestrosService: MaestrosService,
    private alumnosService: AlumnosService,
  ) { }

  ngOnInit(): void {
    this.user.tipo_usuario = '';
    //Obtener de la URL el rol para saber cual editar
    if(this.activatedRoute.snapshot.params['rol'] != undefined){
      this.rol = this.activatedRoute.snapshot.params['rol'];
      console.log("Rol detectado: ", this.rol);
      
      // Mapear el rol de la URL al tipo_usuario para el radio button y activar banderas
      // Soportar tanto singular como plural
      if(this.rol == "administrador"){
        this.user.tipo_usuario = "administrador";
        this.isAdmin = true;
        this.tipo_user = "administrador";
      }else if(this.rol == "maestros" || this.rol == "maestro"){
        this.user.tipo_usuario = "maestro";
        this.isMaestro = true;
        this.tipo_user = "maestro";
      }else if(this.rol == "alumnos" || this.rol == "alumno"){
        this.user.tipo_usuario = "alumno";
        this.isAlumno = true;
        this.tipo_user = "alumno";
      }
    }

    //El if valida si existe un parámetro en la URL
    if(this.activatedRoute.snapshot.params['id'] != undefined){
      this.editar = true;
      //Asignamos a nuestra variable global el valor del ID que viene por la URL
      this.idUser = this.activatedRoute.snapshot.params['id'];
      console.log("ID User: ", this.idUser);
      //Al iniciar la vista obtiene el usuario por su ID
      this.obtenerUserByID();
    }
  }

  //Obtener usuario por ID
  public obtenerUserByID() {
    //Lógica para obtener el usuario según su ID y rol
    console.log("Obteniendo usuario de tipo: ", this.rol, " con ID: ", this.idUser);
    
    if(this.rol == "administrador"){
      this.administradoresService.obtenerAdminPorID(this.idUser).subscribe(
        (response) => {
          console.log("Administrador obtenido: ", response);
          this.user = response;
          // Asignar datos, soportando respuesta plana o anidada
          this.user.first_name = response.user?.first_name || response.first_name;
          this.user.last_name = response.user?.last_name || response.last_name;
          this.user.email = response.user?.email || response.email;
          this.user.telefono = response.telefono;
          this.user.tipo_usuario = "administrador";
          this.isAdmin = true;
        }, (error) => {
          console.error("Error al obtener administrador: ", error);
          alert("No se pudo obtener el administrador seleccionado");
        }
      );
    } else if(this.rol == "maestros" || this.rol == "maestro"){
      this.maestrosService.obtenerMaestroPorID(this.idUser).subscribe(
        (response) => {
          console.log("Maestro obtenido: ", response);
          this.user = response;
          // Asignar datos, soportando respuesta plana o anidada
          this.user.first_name = response.user?.first_name || response.first_name;
          this.user.last_name = response.user?.last_name || response.last_name;
          this.user.email = response.user?.email || response.email;
          this.user.id_trabajador = response.id_trabajador;
          this.user.fecha_nacimiento = response.fecha_nacimiento;
          this.user.telefono = response.telefono;
          this.user.rfc = response.rfc;
          this.user.cubiculo = response.cubiculo;
          this.user.area_investigacion = response.area_investigacion;
          this.user.materias_json = response.materias_json;
          this.user.tipo_usuario = "maestro";
          this.isMaestro = true;
        }, (error) => {
          console.error("Error al obtener maestro: ", error);
          alert("No se pudo obtener el maestro seleccionado");
        }
      );
    } else if(this.rol == "alumnos" || this.rol == "alumno"){
      this.alumnosService.obtenerAlumnoPorID(this.idUser).subscribe(
        (response) => {
          console.log("Alumno obtenido: ", response);
          this.user = response;
          // Asignar datos, soportando respuesta plana o anidada
          this.user.first_name = response.user?.first_name || response.first_name;
          this.user.last_name = response.user?.last_name || response.last_name;
          this.user.email = response.user?.email || response.email;
          this.user.matricula = response.matricula;
          this.user.fecha_nacimiento = response.fecha_nacimiento;
          this.user.curp = response.curp;
          this.user.rfc = response.rfc;
          this.user.edad = response.edad;
          this.user.telefono = response.telefono;
          this.user.ocupacion = response.ocupacion;
          this.user.tipo_usuario = "alumno";
          this.isAlumno = true;
        }, (error) => {
          console.error("Error al obtener alumno: ", error);
          alert("No se pudo obtener el alumno seleccionado");
        }
      );
    }
  }

  public radioChange(event: MatRadioChange) {
    console.log(event);
    if(event.value == "administrador"){
      this.isAdmin = true;
      this.isAlumno = false;
      this.isMaestro = false;
      this.tipo_user = "administrador";
    }else if (event.value == "alumno"){
      this.isAdmin = false;
      this.isAlumno = true;
      this.isMaestro = false;
      this.tipo_user = "alumno";
    }else if (event.value == "maestro"){
      this.isAdmin = false;
      this.isAlumno = false;
      this.isMaestro = true;
      this.tipo_user = "maestro";
    }
  }

  //Función para regresar a la pantalla anterior
  public goBack() {
    this.location.back();
  }

}
