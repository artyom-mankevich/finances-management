import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Pages } from 'src/app/enums/pages';
import { DataService } from 'src/app/services/data.service';
@Component({
  selector: 'app-sidemenu',
  templateUrl: './sidemenu.component.html',
  styleUrls: ['./sidemenu.component.css']
})
export class SidemenuComponent implements OnInit {
  pages = Pages;
  constructor(private router: Router, private ds: DataService) {
    this.ds.getUserSettings().subscribe(val =>{
      if (val && !this.currentPage) {
        this.currentPage =  Pages[val.startPage as keyof typeof Pages];
      }
    })
   }


  @Output()
  pageChangeEvent= new EventEmitter<Pages>();
  currentPage: Pages | undefined;

  ngOnInit(): void {
  }

  changeCurrentPage(page: Pages) {
    this.currentPage = page;
    this.pageChangeEvent.emit(this.currentPage);
  }
  redirectTo(route: string) {
    this.router.navigateByUrl(route);
  }

}
