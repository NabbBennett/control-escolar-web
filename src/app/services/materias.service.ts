import { HttpHeaders, HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FacadeService } from './facade.service';
import { ErrorsService } from './tools/errors.service';
import { ValidatorService } from './tools/validator.service';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MateriasService {

  constructor(
    private http: HttpClient,
    private validatorService: ValidatorService,
    private errorService: ErrorsService,
    private facadeService: FacadeService
  ) { }

  public esquemaMateria(){
    return {
      'nrc': '',
      'nombre': '',
      'seccion': '',
      'dias': [],
      'hora_inicio': '',
      'hora_fin': '',
      'salon': '',
      'programa_educativo': '',
      'profesor_id': '',
      'creditos': ''
    }
  }

  public validarMateria(data: any, editar: boolean){
    console.log("Validando materia... ", data);
    let error: any = [];

    // Validar NRC: Solo números, longitud fija de 5 dígitos
    if(!this.validatorService.required(data["nrc"])){
      error["nrc"] = this.errorService.required;
    } else if(!this.validatorService.numeric(data["nrc"])){
      error["nrc"] = "El NRC debe contener solo números";
    } else if(!this.validatorService.min(data["nrc"], 5)){
      error["nrc"] = "El NRC debe tener 5 dígitos";
    } else if(!this.validatorService.max(data["nrc"], 5)){
      error["nrc"] = "El NRC debe tener 5 dígitos";
    }

    // Validar Nombre: Solo letras y espacios, sin números ni caracteres especiales
    if(!this.validatorService.required(data["nombre"])){
      error["nombre"] = this.errorService.required;
    } else {
      const nombreRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
      if(!nombreRegex.test(data["nombre"])){
        error["nombre"] = "El nombre solo debe contener letras y espacios";
      }
    }

    // Validar Sección: Solo números, máximo 3 dígitos
    if(!this.validatorService.required(data["seccion"])){
      error["seccion"] = this.errorService.required;
    } else if(!this.validatorService.numeric(data["seccion"])){
      error["seccion"] = "La sección debe contener solo números";
    } else if(!this.validatorService.max(data["seccion"], 3)){
      error["seccion"] = "La sección debe tener máximo 3 dígitos";
    }

    // Validar Días: Al menos uno seleccionado
    if(!data["dias"] || data["dias"].length === 0){
      error["dias"] = "Debes seleccionar al menos un día";
    }

    // Validar Hora Inicio
    if(!this.validatorService.required(data["hora_inicio"])){
      error["hora_inicio"] = this.errorService.required;
    }

    // Validar Hora Fin
    if(!this.validatorService.required(data["hora_fin"])){
      error["hora_fin"] = this.errorService.required;
    }

    // Validar que hora_inicio < hora_fin
    if(data["hora_inicio"] && data["hora_fin"]){
      if(data["hora_inicio"] >= data["hora_fin"]){
        error["hora_fin"] = "La hora de fin debe ser mayor que la hora de inicio";
      }
    }

    // Validar Salón: Alfanumérico y espacios, máximo 15 caracteres
    if(!this.validatorService.required(data["salon"])){
      error["salon"] = this.errorService.required;
    } else {
      const salonRegex = /^[a-zA-Z0-9\s]+$/;
      if(!salonRegex.test(data["salon"])){
        error["salon"] = "El salón solo debe contener letras, números y espacios";
      } else if(!this.validatorService.max(data["salon"], 15)){
        error["salon"] = "El salón debe tener máximo 15 caracteres";
      }
    }

    // Validar Programa Educativo
    if(!this.validatorService.required(data["programa_educativo"])){
      error["programa_educativo"] = "Debes seleccionar un programa educativo";
    }

    // Validar Profesor
    if(!this.validatorService.required(data["profesor_id"])){
      error["profesor_id"] = "Debes seleccionar un profesor";
    }

    // Validar Créditos: Solo números enteros positivos, máximo 2 dígitos
    if(!this.validatorService.required(data["creditos"])){
      error["creditos"] = this.errorService.required;
    } else if(!this.validatorService.numeric(data["creditos"])){
      error["creditos"] = "Los créditos deben ser numéricos";
    } else if(parseInt(data["creditos"]) <= 0){
      error["creditos"] = "Los créditos deben ser mayores a 0";
    } else if(!this.validatorService.max(data["creditos"].toString(), 2)){
      error["creditos"] = "Los créditos deben tener máximo 2 dígitos";
    }

    return error;
  }

  public registrarMateria(data: any): Observable<any>{
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.post<any>(`${environment.url_api}/materias/`, data, { headers });
  }

  public obtenerListaMaterias(params?: { page?: number; page_size?: number; search?: string }): Observable<any>{
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    let httpParams = new HttpParams();
    if (params?.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params?.page_size) {
      httpParams = httpParams.set('page_size', params.page_size.toString());
    }
    if (params?.search && params.search.trim().length > 0) {
      httpParams = httpParams.set('search', params.search.trim());
    }
    return this.http.get<any>(`${environment.url_api}/lista-materias/`, { headers, params: httpParams });
  }

  public obtenerMateriaPorID(idMateria: number): Observable<any>{
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.get<any>(`${environment.url_api}/materias/?id=${idMateria}`, { headers });
  }

  public actualizarMateria(data: any): Observable<any>{
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.put<any>(`${environment.url_api}/materias/`, data, { headers });
  }

  public eliminarMateria(idMateria: number): Observable<any>{
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.delete<any>(`${environment.url_api}/materias/?id=${idMateria}`, { headers });
  }

  public verificarNRCUnico(nrc: string): Observable<any>{
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.get<any>(`${environment.url_api}/verificar-nrc/?nrc=${nrc}`, { headers });
  }

  // Obtener materias registradas por día (últimos 7 días)
  public obtenerMateriasRegistradasPorDia(): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.get<any>(`${environment.url_api}/materias-por-dia/`, { headers });
  }
}