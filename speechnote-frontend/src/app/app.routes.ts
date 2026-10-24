
import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { TranscriptionHistory } from './transcription-history/transcription-history';

export const routes: Routes = [
  {
    path: 'dashboard',component: Dashboard
  },

   {
    path: 'history',
    component: TranscriptionHistory
  },
  {
    path: '', 
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
