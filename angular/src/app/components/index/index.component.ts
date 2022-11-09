import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';

import { Features } from 'src/app/enums/features';


@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css'],
  animations: [trigger('slideIn', [transition(':enter', [
    style({
      transform: 'translatex(100%)'
    }),
    animate('200ms ease-in'), style({ transform: 'translateX(0px)' }),
  ])])]
})
export class IndexComponent implements OnInit {
  Features = Features;
  highlightedFeature = Features.Transactions;
  constructor(public auth: AuthService) { }

  ngOnInit(): void { }

  selectFeature(feature: Features) {
    this.highlightedFeature = feature;
  }

  scroll(el: HTMLElement) {
    el.scrollIntoView({ behavior: 'smooth' });
  }

  signin() {
    this.auth.loginWithRedirect();
  }

}

