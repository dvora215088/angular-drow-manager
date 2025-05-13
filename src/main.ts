import { bootstrapApplication } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http'; // ייבוא HttpClientModule
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';

// חיבור כל הקונפיגורציות יחד
bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(), 
    provideRouter(routes),
    // מספק אנימציות
    HttpClientModule,     // מספק HttpClient
    ...appConfig.providers // ייבוא של כל ה־providers מקובץ app.config
  ],
})
  .catch((err) => console.error(err));
