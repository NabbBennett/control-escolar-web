import { Component, OnInit } from '@angular/core';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';
import { AdministradoresService } from 'src/app/services/administradores.service';
import { MaestrosService } from 'src/app/services/maestros.service';
import { AlumnosService } from 'src/app/services/alumnos.service';
import { MateriasService } from 'src/app/services/materias.service';

@Component({
  selector: 'app-graficas-screen',
  templateUrl: './graficas-screen.component.html',
  styleUrls: ['./graficas-screen.component.scss']
})
export class GraficasScreenComponent implements OnInit{

  //Variables
  public total_administradores: number = 0;
  public total_maestros: number = 0;
  public total_alumnos: number = 0;

  //Histograma
  lineChartData = {
    labels: [] as string[],  // Se llenará dinámicamente
    datasets: [
      {
        data: [] as number[],  // Se llenará dinámicamente
        label: 'Materias registradas',
        backgroundColor: '#F88406'
      }
    ]
  }
  lineChartOption = {
    responsive:false
  }
  lineChartPlugins = [ DatalabelsPlugin ];

  //Barras
  barChartData = {
    labels: ["Congreso", "FePro", "Presentación Doctoral", "Feria Matemáticas", "T-System"],
    datasets: [
      {
        data:[34, 43, 54, 28, 74],
        label: 'Eventos Académicos',
        backgroundColor: [
          '#F88406',
          '#FCFF44',
          '#82D3FB',
          '#FB82F5',
          '#2AD84A'
        ]
      }
    ]
  }
  barChartOption = {
    responsive:false
  }
  barChartPlugins = [ DatalabelsPlugin ];

  //Circular
  pieChartData = {
    labels: ["Administradores", "Maestros", "Alumnos"],
    datasets: [
      {
        data: [0, 0, 0],  // Se inicializa en 0, se actualizará con datos reales
        label: 'Registro de usuarios',
        backgroundColor: [
          '#FCFF44',
          '#F1C8F2',
          '#31E731'
        ]
      }
    ]
  }
  pieChartOption = {
    responsive:false
  }
  pieChartPlugins = [ DatalabelsPlugin ];

  //Dona - Doughnut
  doughnutChartData = {
    labels: ["Administradores", "Maestros", "Alumnos"],
    datasets: [
      {
        data: [0, 0, 0],  // Se inicializa en 0, se actualizará con datos reales
        label: 'Registro de usuarios',
        backgroundColor: [
          '#F88406',
          '#FCFF44',
          '#31E7E7'
        ]
      }
    ]
  }
  doughnutChartOption = {
    responsive:false
  }
  doughnutChartPlugins = [ DatalabelsPlugin ];

  constructor(
    private administradoresService: AdministradoresService,
    private maestrosService: MaestrosService,
    private alumnosService: AlumnosService,
    private materiasService: MateriasService
  ) { }

  ngOnInit(): void {
    this.obtenerTotalUsuarios();
    this.obtenerMateriasRegistradas();
  }

  // Función para obtener el total de usuarios registrados desde el backend
  public obtenerTotalUsuarios(): void {
    this.administradoresService.getTotalUsuarios().subscribe(
      (response) => {
        console.log('Total de usuarios desde BD:', response);
        this.total_administradores = response.admins || 0;
        this.total_maestros = response.maestros || 0;
        this.total_alumnos = response.alumnos || 0;
        this.actualizarGraficasUsuarios();
      },
      (error) => {
        console.error('Error al obtener total de usuarios:', error);
        alert('No se pudo obtener el total de usuarios desde la base de datos');
      }
    );
  }

  // Función para obtener materias registradas 
  public obtenerMateriasRegistradas(): void {
    this.materiasService.obtenerMateriasRegistradasPorDia().subscribe(
      (response) => {
        console.log('Materias registradas por día desde BD:', response);
        
        // Actualizar el histograma con los datos reales 
        this.lineChartData = {
          labels: response.labels || [],
          datasets: [
            {
              data: response.data || [],
              label: 'Materias registradas',
              backgroundColor: '#F88406'
            }
          ]
        };
        
        console.log('Histograma actualizado:', {
          labels: this.lineChartData.labels,
          data: this.lineChartData.datasets[0].data
        });
      },
      (error) => {
        console.error('Error al obtener materias por día:', error);
      }
    );
  }

  // Función para actualizar las gráficas de usuarios
  private actualizarGraficasUsuarios(): void {
    // Actualizar datos de la gráfica circular (pie)
    this.pieChartData = {
      labels: ["Administradores", "Maestros", "Alumnos"],
      datasets: [
        {
          data: [
            this.total_administradores,
            this.total_maestros,
            this.total_alumnos
          ],
          label: 'Registro de usuarios',
          backgroundColor: [
            '#FCFF44',
            '#F1C8F2',
            '#31E731'
          ]
        }
      ]
    };

    // Actualizar datos de la gráfica de dona (doughnut)
    this.doughnutChartData = {
      labels: ["Administradores", "Maestros", "Alumnos"],
      datasets: [
        {
          data: [
            this.total_administradores,
            this.total_maestros,
            this.total_alumnos
          ],
          label: 'Registro de usuarios',
          backgroundColor: [
            '#F88406',
            '#FCFF44',
            '#31E7E7'
          ]
        }
      ]
    };

    console.log('Gráficas de usuarios actualizadas:', {
      administradores: this.total_administradores,
      maestros: this.total_maestros,
      alumnos: this.total_alumnos,
      pieData: this.pieChartData.datasets[0].data,
      doughnutData: this.doughnutChartData.datasets[0].data
    });
  }

}
