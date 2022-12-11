import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AnalyticsCategoires } from 'src/app/models/analyticsCategories';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-analytics-page',
  templateUrl: './analytics-page.component.html',
  styleUrls: ['./analytics-page.component.css']
})
export class AnalyticsPageComponent implements OnInit {
  analyticsCategories$: Observable<AnalyticsCategoires | undefined> = this.ds.getUsersTopCategories();
  constructor(private ds: DataService) { }

  ngOnInit(): void {
  }

}
