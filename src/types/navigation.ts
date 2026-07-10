import type { MainTab } from './exercise';

export type HomeRoute =
  | 'mainMenu'
  | 'dailySession'
  | 'aprende'
  | 'entrena'
  | 'desafios'
  | 'perfil';

export type AprendeRoute = 'nivelPicker' | 'nivelVisualization';

export type MainMenuDestination =
  | 'dailySession'
  | 'aprende'
  | 'entrena'
  | 'desafios'
  | 'settings';

export const HOME_ROUTE_TO_TAB: Record<
  Exclude<HomeRoute, 'dailySession' | 'perfil'>,
  MainTab
> = {
  mainMenu: 'menu',
  aprende: 'aprende',
  entrena: 'entrena',
  desafios: 'desafios',
};
