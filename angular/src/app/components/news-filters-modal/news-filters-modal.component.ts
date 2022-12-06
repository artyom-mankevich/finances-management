import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { NewsFilter } from 'src/app/models/newsFilter';
import { NewsLanguage } from 'src/app/models/newsLanguages';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-news-filters-modal',
  templateUrl: './news-filters-modal.component.html',
  styleUrls: ['./news-filters-modal.component.css']
})
export class NewsFiltersModalComponent implements OnInit {

  newsFilter$: Observable<NewsFilter | undefined> = this.ds.getUserNewsFilter();
  newsLanguges$: Observable<NewsLanguage[]> = this.ds.getAvailableNewsLanguages();
  constructor(private ds: DataService) { }

  ngOnInit(): void {
  }

}
