import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ENDPOINT } from 'src/constants/enpoint.contant';
import {ICountry} from 'src/models/country.model';
import { BaseService } from 'src/services/common/http.service';
import {ICountryService} from "../interfaces/country-service.interface";

@Injectable({
  providedIn: 'root',
})

export class CountryService
  extends BaseService
  implements ICountryService
{
  private countryUrl = ENDPOINT.COUNTRY;
  constructor(httpClient: HttpClient) {
    super(httpClient);
  }

  getAllCountry() {
    return this.GET<ICountry>(this.countryUrl).pipe();
  }

  getCountryById(id: string): Observable<ICountry> {
    return this.GET<ICountry>(this.countryUrl).pipe();
  }

  createCountry(params) {
    return this.POST(this.countryUrl, params);
  }

  updateCountry(params) {
    return this.PUT(this.countryUrl, params);
  }

  deleteCountry(id :string):Observable<any>{
    return this.DELETE(this.countryUrl);
  }
}
