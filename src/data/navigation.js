import {
  BarChart3,
  CalendarRange,
  Eye,
  Heart,
  LayoutDashboard,
  Megaphone,
  TrendingUp,
  Wallet,
} from 'lucide-react'

/** Secciones del panel: orden, etiqueta, icono y texto de apoyo. */
export const VIEWS = [
  {
    id: 'rezumat',
    label: 'Rezumat',
    icon: LayoutDashboard,
    subtitle: 'Privire de ansamblu asupra creșterii și a investiției',
  },
  {
    id: 'crestere',
    label: 'Creștere',
    icon: TrendingUp,
    subtitle: 'Cum evoluează comunitatea, lună de lună',
  },
  {
    id: 'audienta',
    label: 'Audiență',
    icon: Eye,
    subtitle: 'Cine vede conținutul și de unde ajunge la noi',
  },
  {
    id: 'interactiuni',
    label: 'Interacțiuni',
    icon: Heart,
    subtitle: 'Aprecieri, comentarii, distribuiri și salvări',
  },
  {
    id: 'investitie',
    label: 'Investiție',
    icon: Wallet,
    subtitle: 'Unde se duce bugetul și ce randament are',
  },
  {
    id: 'campanii',
    label: 'Campanii',
    icon: Megaphone,
    subtitle: 'Rezultatele fiecărei campanii de publicitate',
  },
  {
    id: 'trimestrial',
    label: 'Trimestrial',
    icon: CalendarRange,
    subtitle: 'Sinteză pe trimestre',
  },
  {
    id: 'anual',
    label: 'Anual',
    icon: BarChart3,
    subtitle: 'Sinteză pe ani și comparație cu anul precedent',
  },
]

export const VIEW_BY_ID = Object.fromEntries(VIEWS.map((v) => [v.id, v]))
