import { FormArray, FormControl, FormGroup } from "@angular/forms";

export interface ButtonConfig {
    bocNrId?: string;
    bocTxDescricao: string;
    bocTxCor?: string;
    bocTxBackgroundColor?: string;
    bocTxAnimacao?: 'none' | 'pulse' | 'shake' | 'float' | 'bounce';
    bocTxUrl?: string; // classe fontawesome
}

export type ButtonConfigForm = {
  bocNrId: FormControl<string | null>;
  bocTxDescricao: FormControl<string | null>;
  bocTxCor: FormControl<string | null>;
  bocTxBackgroundColor: FormControl<string | null>;
  bocTxAnimacao: FormControl<'none' | 'pulse' | 'shake' | 'float' | 'bounce' | null>;
  bocTxUrl: FormControl<string | null>;
};


export interface LandingConfig {
    lacNrId: number;
    backgroundType: 'COR' | 'IMAGE' | 'GRADIENT';
    backgroundValue: string; // hex, url(...) ou linear-gradient(...)
    overlayColor?: string; // rgba overlay
    lacTxDescricao?: string;
    lacBlAtivo: boolean;
    botoes: ButtonConfig[];
}

export type LandingConfigForm = {
  lacNrId: FormControl<number | null>;
  backgroundType: FormControl<'COR' | 'IMAGE' | 'GRADIENT' | null>;
  backgroundValue: FormControl<string | null>;
  overlayColor: FormControl<string | null>;
  lacTxDescricao: FormControl<string | null>;
  lacBlAtivo: FormControl<boolean | null>;
  botoes: FormArray<FormGroup<ButtonConfigForm>>;
};

export const DEFAULT_LANDING: LandingConfig = {
    lacNrId: 0,
    backgroundType: 'GRADIENT',
    backgroundValue: '#0066ff',
    overlayColor: 'rgba(0,0,0,0)',
    lacTxDescricao: 'Bem-vindo à nossa Landing Page!',
    lacBlAtivo: false,
    botoes: [
        { bocTxDescricao: 'Quero Participar', bocTxCor: '#fff', bocTxBackgroundColor: '#1976d2', bocTxAnimacao: 'pulse', bocTxUrl: '#' },
        { bocTxDescricao: 'Saber Mais', bocTxCor: '#1976d2', bocTxBackgroundColor: '#ffffff', bocTxAnimacao: 'none', bocTxUrl: '#' }
    ]
};