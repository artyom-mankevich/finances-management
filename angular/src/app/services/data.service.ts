import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiEndpoints, environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private url: string = environment.baseUrl;
  constructor(private http: HttpClient) {
  }
  getTest() : Observable<any> {
    return this.http.get(`${this.url}${ApiEndpoints.test}`)
  }
}
