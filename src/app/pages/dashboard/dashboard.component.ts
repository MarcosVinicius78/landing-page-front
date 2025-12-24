import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
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
import { SistemaDto, SistemaService } from '../../shared/service/sistema.service';
import { SistemaEnum } from '../pagina-captura/pagina-captura.component';
import { TotalSistemasDto } from './models/total-sistemas';
import { LandingSettingsComponent } from "../landing-settings.component/landing-settings.component";

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

export type ChartOptionsPizza = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, NgApexchartsModule, ConfiguracaoComponent, CommonModule, LandingSettingsComponent],
  templateUrl: './dashboard.component.html',
  providers: [DatePipe]
})
export class DashboardComponent implements OnInit {

  readonly #dadosDashboardService = inject(DadosDashboardService);
  readonly #datePipe = inject(DatePipe);
  readonly #sistemaService = inject(SistemaService)

  @ViewChild("chart") chart!: ChartComponent;
  public chartOptions!: Partial<ChartOptions>;

  @ViewChild("chartPizza") chartPizza!: ChartComponent;
  public chartOptionsPizza!: Partial<ChartOptionsPizza>;

  sistemasDto: SistemaDto[] = [];
  sistemaSelecionado = signal<SistemaEnum | null>(SistemaEnum.SERGIPE_OFERTAS);
  totalSistemasDto = signal<TotalSistemasDto[] | null>([]);
  sistemas = Object.entries(SistemaEnum);

  filtros = {
    data: '',
    dataFim: '',
    horaInicio: '00:00',
    horaFim: '00:00',
  };

  totalPagina!: number;
  totalGrupo!: number;
  totalIntervalo!: number;
  totalLinkEncurtado!: number;
  taxaRejeicao!: number;

  horasDistribuicao: HoraDistribuicao[] = [];
  tab: string = 'DASHBOARD';

  ngOnInit(): void {
    this.filtros.data = this.#datePipe.transform(new Date(), 'yyyy-MM-dd')!;

    this.aplicarFiltros();
  }

  aplicarFiltros() {
    const { data, dataFim ,horaInicio, horaFim } = this.filtros;

    this.#buscarDesempenhosSistemas(data);

    this.#buscarCliquesPorFaixa(data, horaInicio, horaFim, this.sistemaSelecionado()!);
    this.#buscarTotais(data, dataFim, this.sistemaSelecionado()!);
    this.#buscarDistribuicaoPorHora(data, this.sistemaSelecionado()!);
  }

  #buscarDesempenhosSistemas(data: string) {
    this.#dadosDashboardService.buscarDesempenhosSisemas(data).subscribe({
      next: (res) => {
        this.totalSistemasDto.set(res);
        this.iniciarGraficoPizza();
      }
    })
  }

  #calcularTaxaRejeicao() {
    this.taxaRejeicao = ((this.totalPagina - this.totalGrupo) / this.totalPagina) * 100;
  }

  #buscarCliquesPorFaixa(data: string, inicio: string, fim: string, sistema: SistemaEnum) {
    this.#dadosDashboardService.getCliquesPorFaixa(data, inicio, fim, sistema).subscribe({
      next: (res) => this.totalIntervalo = res.total
    });
  }

  #buscarDistribuicaoPorHora(data: string, sistema: SistemaEnum) {
    this.#dadosDashboardService.getCliquesPorHora(data, sistema).subscribe(response => {
      this.horasDistribuicao = response;

      const horas = this.horasDistribuicao.map(d => `${d.hora}`);
      const totalCliques = this.horasDistribuicao.map(d => d.totalCliques); 1
      const totalAcessos = this.horasDistribuicao.map(d => d.totalAcessos); 1
      this.iniciarGrafico(horas, totalCliques, totalAcessos)
    });
  }

  #buscarTotais(data: string, dataFim: string ,sistema: SistemaEnum) {
    forkJoin({
      pagina: this.#dadosDashboardService.getTotalCliques(data, dataFim, 'PAGINA', sistema),
      grupo: this.#dadosDashboardService.getTotalCliques(data, dataFim, 'GRUPO', sistema),
      linkEncurtado: this.#dadosDashboardService.getTotalCliques(data, dataFim, 'ENCURTADO', sistema)
    }).subscribe(({ pagina, grupo, linkEncurtado }) => {
      this.totalPagina = pagina.total
      this.totalGrupo = grupo.total;
      this.totalLinkEncurtado = linkEncurtado.total;
      this.#calcularTaxaRejeicao();
    })
  }

  selecionarTab(tab: string) {
    this.tab = tab;
  }

  iniciarGraficoPizza() {
    const dados = this.totalSistemasDto();
    if (!dados) return;

    this.chartOptionsPizza = {
      series: dados.map(d => d.totalGrupo),
      chart: {
        width: 400,
        type: "pie"
      },
      labels: dados.map(d => d.origem),
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200
            },
            legend: {
              position: "bottom"
            }
          }
        }
      ]
    };
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
