import { ApplicationConfig } from '@angular/core';
import { provideRouter,ROUTER_CONFIGURATION} from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes),
    {
      provide: ROUTER_CONFIGURATION,
      useValue: {
        anchorScrolling: 'enabled',
        scrollOffset: [0, 70],
      },
    },
    provideHttpClient()]
};
