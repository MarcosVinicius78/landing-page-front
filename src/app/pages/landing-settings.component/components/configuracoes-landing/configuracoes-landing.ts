import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, Injector, input, OnInit, output, Output, runInInjectionContext, signal, untracked } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { SistemaDto, SistemaService } from '../../../../shared/service/sistema.service';
import { ButtonConfig, ButtonConfigForm, DEFAULT_LANDING, LandingConfig, LandingConfigForm } from '../../model/landing-config.model';
import { LandingService } from '../../service/landing.service';
import { Observable, of, switchMap } from 'rxjs';
import { ArquivoImagemService } from '../../service/arquivoImagem.service';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { LandingConfigStateService } from '../../service/landing-config-state.service';

@Component({
  selector: 'app-configuracoes-landing',
  standalone: true,
  imports: [FormsModule, CommonModule, AngularEditorModule, ReactiveFormsModule],
  templateUrl: './configuracoes-landing.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfiguracoesLanding implements OnInit {

  // Services
  readonly sistemaService = inject(SistemaService);
  readonly landingPageService = inject(LandingService);
  readonly arquivoImagemService = inject(ArquivoImagemService);
  readonly landingStateService = inject(LandingConfigStateService);

  // inputs/outputs
  sisNrIdSelecionado = output<number | null>();
  // config = signal<LandingConfig>(DEFAULT_LANDING);
  config = input<LandingConfig | null>(null);
  configChange = output<LandingConfig>();

  // Variables
  arquivoSelecionado!: File;

  // DTOs
  sistemasDto: SistemaDto[] = [];
  sistemasSelecionadoDto!: SistemaDto;

  // forms
  form = signal<FormGroup | null>(null)
  formBuilder = inject(FormBuilder);

  constructor(private injector: Injector) {
    effect(() => {
      const cfg = this.config();
      if (!cfg) return;

      if (this.form()?.value.lacNrId === cfg.lacNrId) return;

      this.patchFormFromConfig(cfg);
    });
  }

  ngOnInit(): void {
    this.#carregarSistemas();
    this.initFormsReactive();
  }

  initFormsReactive() {
    this.form.set(
      this.formBuilder.group<LandingConfigForm>({
        lacNrId: this.formBuilder.control<number | null>(null),
        backgroundType: this.formBuilder.control<'COR' | 'IMAGE' | 'GRADIENT' | null>(null),
        backgroundValue: this.formBuilder.control<string | null>(null),
        lacBlAtivo: this.formBuilder.control<boolean | null>(null),
        overlayColor: this.formBuilder.control<string | null>(null),
        lacTxDescricao: this.formBuilder.control<string | null>(null),
        botoes: this.formBuilder.array<FormGroup<ButtonConfigForm>>([])
      })
    );

    this.form()?.valueChanges.subscribe((val) => {
      untracked(() => {
        this.landingStateService.update(val);
      })
    });
  }

  #carregarSistemas(): void {
    this.sistemaService.listarSistemas().subscribe({
      next: (res) => {
        this.sistemasDto = res;
      }
    });
  }

  $salvarConfig(): void {
    const sisId = this.sistemasSelecionadoDto.sisNrId;

    const config = this.form()?.value as LandingConfig;

    const request$ = this.config()?.lacNrId
      ? this.landingPageService.atualizarConfiguracao(sisId, config)
      : this.landingPageService.salvarConfiguracao(sisId, config);

    request$
      .pipe(
        switchMap(() => this.#enviarImagem())
      )
      .subscribe({
        next: () => {
          alert('Configuração salva com sucesso!');
        },
        error: (err) => {
          console.error('Erro ao salvar configuração da landing page:', err);
        }
      });
  }

  #enviarImagem(): Observable<any> {
    if (!this.arquivoSelecionado) {
      console.log("Aqui")
      return of(null);
    }

    return this.arquivoImagemService.uploadImagem(
      this.sistemasSelecionadoDto.sisNrId,
      this.arquivoSelecionado
    );
  }

  private createBotaoForm(
    botao?: Partial<LandingConfig['botoes'][number]>
  ): FormGroup<ButtonConfigForm> {
    return this.formBuilder.group<ButtonConfigForm>({
      bocNrId: this.formBuilder.control(botao?.bocNrId ?? null),
      bocTxDescricao: this.formBuilder.control(botao?.bocTxDescricao ?? null),
      bocTxCor: this.formBuilder.control(botao?.bocTxCor ?? null),
      bocTxBackgroundColor: this.formBuilder.control(botao?.bocTxBackgroundColor ?? null),
      bocTxAnimacao: this.formBuilder.control(botao?.bocTxAnimacao ?? null),
      bocTxUrl: this.formBuilder.control(botao?.bocTxUrl ?? null),
    });
  }

  get listaBotoes(): FormArray<FormGroup<ButtonConfigForm>> {
    return this.form()?.get('botoes') as FormArray<FormGroup<ButtonConfigForm>>;
  }

  private patchFormFromConfig(cfg: LandingConfig) {
    this.form()!.patchValue({
      lacNrId: cfg.lacNrId,
      backgroundType: cfg.backgroundType,
      backgroundValue: cfg.backgroundValue,
      overlayColor: cfg.overlayColor,
      lacTxDescricao: cfg.lacTxDescricao,
      lacBlAtivo: cfg.lacBlAtivo,
    }, { emitEvent: false });

    this.rebuildBotoes(cfg.botoes);
  }

  private rebuildBotoes(botoes: LandingConfig['botoes']) {
    const array = this.listaBotoes;
    array.clear({ emitEvent: false });

    queueMicrotask(() => {
      for (const botao of botoes) {
        array.push(this.createBotaoForm(botao), { emitEvent: false });
      }
    });
  }

  sistemaEscolhido() {
    // this.carregarConfiguracoesLanding(this.sistemasSelecionadoDto.sisNrId);
    this.sisNrIdSelecionado.emit(this.sistemasSelecionadoDto.sisNrId);
  }

  removeButton(botNrId: number) {
    this.landingStateService.removeBotao(botNrId);
    this.listaBotoes.removeAt(botNrId);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    // preview em tempo real
    this.landingStateService.setImagemPreview(file);

    // se quiser salvar depois, guarda o file
    this.arquivoSelecionado = file;
  }

  addButton() {
    this.listaBotoes.push(this.createBotaoForm());
  }
}
