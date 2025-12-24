export interface ButtonConfig {
    bocNrId?: string;
    bocTxDescricao: string;
    bocTxCor?: string;
    bocTxBackgroundColor?: string;
    bocTxAnimacao?: 'none' | 'pulse' | 'shake' | 'float' | 'bounce';
    bocTxUrl?: string; // classe fontawesome
}


export interface LandingConfig {
    lacNrId: number;
    backgroundType: 'COR' | 'IMAGE' | 'GRADIENT';
    backgroundValue: string; // hex, url(...) ou linear-gradient(...)
    overlayColor?: string; // rgba overlay
    lacTxDescricao?: string;
    lacBlAtivo: boolean;
    botoes: ButtonConfig[];
}


export const DEFAULT_LANDING: LandingConfig = {
    lacNrId: 0,
    backgroundType: 'GRADIENT',
    backgroundValue: 'linear-gradient(90deg, #0066ff 0%, #00ccff 100%)',
    overlayColor: 'rgba(0,0,0,0.0)',
    lacTxDescricao: 'Bem-vindo à nossa Landing Page!',
    lacBlAtivo: true,
    botoes: [
        { bocNrId: 'b1', bocTxDescricao: 'Quero Participar', bocTxCor: '#fff', bocTxBackgroundColor: '#1976d2', bocTxAnimacao: 'pulse', bocTxUrl: '#' },
        { bocNrId: 'b2', bocTxDescricao: 'Saber Mais', bocTxCor: '#1976d2', bocTxBackgroundColor: '#ffffff', bocTxAnimacao: 'none', bocTxUrl: '#' }
    ]
};