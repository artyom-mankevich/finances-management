import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Pages } from 'src/app/enums/pages';
@Component({
  selector: 'app-sidemenu',
  templateUrl: './sidemenu.component.html',
  styleUrls: ['./sidemenu.component.css']
})
export class SidemenuComponent implements OnInit {
  pages = Pages;
  constructor(private router: Router) { }

  currentPage: Pages = Pages.Overview;
  ngOnInit(): void {
  }

  changeCurrentPage(page: Pages) {
    this.currentPage = page;
  }
  redirectTo(route: string) {
    this.router.navigateByUrl(route);
  }

}
