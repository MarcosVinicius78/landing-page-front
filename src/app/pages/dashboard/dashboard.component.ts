import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';

import {
  ApexAxisChartSeries,
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexPlotOptions,
  ApexYAxis,
  ApexTitleSubtitle,
  ApexXAxis,
  ApexFill,
  NgApexchartsModule
} from "ng-apexcharts";
import { ConfiguracaoComponent } from '../configuracao/configuracao.component';
import { HoraDistribuicao } from './models/hora-distribuicao';
import { ClickRegisterService } from '../../shared/service/click-register.service';
import { DadosDashboardService } from './service/dados-dashboard.service';
import { forkJoin } from 'rxjs';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  fill: ApexFill;
  title: ApexTitleSubtitle;
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, NgApexchartsModule, ConfiguracaoComponent, CommonModule],
  templateUrl: './dashboard.component.html',
  providers: [DatePipe]
})
export class DashboardComponent implements OnInit {

  readonly #dadosDashboardService = inject(DadosDashboardService);
  readonly #datePipe = inject(DatePipe);

  @ViewChild("chart") chart!: ChartComponent;
  public chartOptions!: Partial<ChartOptions>;


  filtros = {
    data: '',
    horaInicio: '00:00',
    horaFim: '00:00',
  };

  totalPagina!: number;
  totalGrupo!: number;
  totalIntervalo!: number;
  taxaRejeicao!: number;

  horasDistribuicao: HoraDistribuicao[] = [];
  tab: string = 'DASHBOARD';

  ngOnInit(): void {
    this.filtros.data = this.#datePipe.transform(new Date(), 'yyyy-MM-dd')!;

    this.aplicarFiltros();
  } 

  aplicarFiltros() {
    const { data, horaInicio, horaFim } = this.filtros;

    this.#buscarCliquesPorFaixa(data, horaInicio, horaFim);
    this.#buscarTotais(data);
    this.#buscarDistribuicaoPorHora(data);
  }

  #calcularTaxaRejeicao() {
    this.taxaRejeicao = ((this.totalPagina - this.totalGrupo) / this.totalPagina) * 100;
  }

  #buscarCliquesPorFaixa(data: string, inicio: string, fim: string) {
    this.#dadosDashboardService.getCliquesPorFaixa(data, inicio, fim).subscribe({
      next: (res) => this.totalIntervalo = res.total
    });
  }

  #buscarDistribuicaoPorHora(data: string) {
    this.#dadosDashboardService.getCliquesPorHora(data).subscribe(response => {
      this.horasDistribuicao = response;

      const horas = this.horasDistribuicao.map(d => `${d.hora} Hora`);  // Convertendo as horas para o formato 'Hora 0', 'Hora 1', etc.
      const totalCliques = this.horasDistribuicao.map(d => d.totalCliques); 1
      const totalAcessos = this.horasDistribuicao.map(d => d.totalAcessos); 1
      this.iniciarGrafico(horas, totalCliques, totalAcessos)
    });
  }

  #buscarTotais(data: string) {
    forkJoin({
      pagina: this.#dadosDashboardService.getTotalCliques(data, 'PAGINA'),
      grupo: this.#dadosDashboardService.getTotalCliques(data, 'GRUPO')
    }).subscribe(({ pagina, grupo }) => {
      this.totalPagina = pagina.total
      this.totalGrupo = grupo.total;
      this.#calcularTaxaRejeicao();
    })
  }

  selecionarTab(tab: string) {
    this.tab = tab;
  }

  iniciarGrafico(horas: any, totalCliques: any, totalAcessos: any) {
    this.chartOptions = {
      series: [
        {
          name: "Cliques",
          data: totalCliques
        },
        {
          name: "Acessos",
          data: totalAcessos
        }
      ],
      chart: {
        height: 350,
        type: "bar"
      },
      plotOptions: {
        bar: {
          dataLabels: {
            position: "top"
          },
          columnWidth: '50%' // ajuste aqui
        }
      },
      dataLabels: {
        enabled: true,
        offsetY: -20,
        style: {
          fontSize: "12px",
          colors: ["#304758"]
        }
      },
      xaxis: {
        categories: horas,
        position: "bottom",
        labels: {
          offsetY: -1
        },
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        },
        crosshairs: {
          fill: {
            type: "gradient",
            gradient: {
              colorFrom: "#D8E3F0",
              colorTo: "#BED1E6",
              stops: [0, 100],
              opacityFrom: 0.4,
              opacityTo: 0.5
            }
          }
        },
        tooltip: {
          enabled: true,
          offsetY: -35
        }
      },
      yaxis: {
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        },
        labels: {
          show: false
        }
      }
    };

  }
}
