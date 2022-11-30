import { Component } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { DataStorageService } from './services/data-storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Trpo';
  constructor(public auth: AuthService, private dss: DataStorageService) {}
}
