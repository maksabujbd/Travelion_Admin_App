import { Observable } from 'rxjs';
import {ICountry} from '../../models/country.model';
export interface ICountryService {
  getAllCountry():Observable<ICountry>;
  getCountryById(id: string): Observable<ICountry>;
  createCountry(params): Observable<any>;
  updateCountry(params): Observable<any>;
  deleteCountry(id:string):Observable<any>;
}
