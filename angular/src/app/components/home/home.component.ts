import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { tap } from 'rxjs';
import { Pages } from 'src/app/enums/pages';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  animations: [trigger('fadeIn', [transition(':enter', [
    style({
      opacity: 0
    }),
    animate('100ms ease-in'), style({ opacity: 1 }),
  ])])]
})
export class HomeComponent implements OnInit {

  constructor(public auth: AuthService, private ds: DataService) {
    this.ds.getUserSettings().subscribe(val =>{
      if (val) {
        this.currentPage = Pages[val.startingPage as keyof typeof Pages];
      }
    })
  }

  pages = Pages;
  currentPage: Pages = Pages.Overview;
  profileJson: string = '';
  userSettings$ = this.ds.getUserSettings();
  changePage(event: any) {
    this.currentPage = event;
  }

  ngOnInit(): void {
    this.auth.user$.subscribe((profile) => {
      this.profileJson = JSON.stringify(profile, null, 2);
    })
  }

}
