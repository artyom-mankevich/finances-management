import { Component, Input, OnInit } from '@angular/core';
import { News } from 'src/app/models/news';

@Component({
  selector: 'app-news-entry [news]',
  templateUrl: './news-entry.component.html',
  styleUrls: ['./news-entry.component.css']
})
export class NewsEntryComponent implements OnInit {

  @Input()
  news!: News;
  constructor() { }

  ngOnInit(): void {
  }

}
