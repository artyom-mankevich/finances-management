import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Observable, tap } from 'rxjs';
import { NewsFilter } from 'src/app/models/newsFilter';
import { NewsLanguage } from 'src/app/models/newsLanguages';
import { DataStorageService } from 'src/app/services/data-storage.service';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-news-filters-modal',
  templateUrl: './news-filters-modal.component.html',
  styleUrls: ['./news-filters-modal.component.css']
})
export class NewsFiltersModalComponent implements OnInit {
  newsFilter$: Observable<NewsFilter | undefined> = this.ds.getUserNewsFilter();
  newsLanguges$: Observable<NewsLanguage[]> = this.ds.getAvailableNewsLanguages();
  constructor(private ds: DataService, private dialogRef: MatDialogRef<NewsFiltersModalComponent>) { }

  ngOnInit(): void {
  }

  updateDisabled: boolean = false;
  filterPresent(language: NewsLanguage, filter: NewsFilter) {
    if (!filter.languages) {
      return false;
    }
    for (let val of filter.languages.values()) {
      if (val === language.code) {
        return true;
      }
    }
    return false;
  }

  addLanguage(code: string) {
    this.ds.addLanguageFilter(code);
  }

  removeLanguage(code: string) {
    this.ds.removeLanguageFilter(code);
  }

  updateNewsFilter() {
    this.updateDisabled = true;
    this.ds.updateNewsFilter().subscribe(() => {
      this.dialogRef.close();
    });
  }

}
