import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { SkipSelf } from '@angular/core';
import { environment } from 'src/environments/environment';
import { map, tap } from 'rxjs/operators';
import {Observable} from "rxjs";
import * as _ from 'lodash';
class ResponseData {
  status: String;
  code: String;
  data: any;
  paginate?: any;
}

export abstract class BaseService {
  protected baseUrl = environment.apiBaseUrl;
  constructor(@SkipSelf() private http: HttpClient) {}

  protected get httpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };
  }
  protected get fileHttpOptions() {
    return {
      headers: new HttpHeaders({
        mimeType: 'multipart/form-data', //'enctype': 'multipart/form-data'
      }),
    };
  }

  protected get<T>(relativeUrl:string){
    return this.http.get<any>(this.baseUrl + relativeUrl);
  }

  protected getByApiUrl<T>(relativeUrl: string, params: string) {
    return this.http.get<any>(this.baseUrl + relativeUrl + '/' + params);
  }

  protected post<T>(relativeUrl:string, model:any){
    return this.http.post<any>(this.baseUrl + relativeUrl, model);
  }

  protected put<T>(relativeUrl:string, model:any){
    return this.http.put<any>(this.baseUrl + relativeUrl, model);
  }

  protected delete(relativeUrl:string, params: string) {
    return this.http.delete<any>(this.baseUrl + relativeUrl + '/' + params);
  }

  protected GET<T>(relativeUrl: string, params?: Object): Observable<T> {
    const httpParams = this.buildParams(params);
    return this.http
      .get<ResponseData>(this.baseUrl + relativeUrl, {
        ...this.httpOptions,
        ...(httpParams && { params: httpParams }),
      })
      .pipe(
        tap(
          // Log the result or error
          (value) => value,
          (error) => console.error(error)
        ),
        map((value: ResponseData) => value?.data)
      );
  }

  protected POST<T, V>(
    relativeUrl: string,
    data: V,
    params?: Object
  ): Observable<T> {
    const httpParams = this.buildParams(params);

    return this.http
      .post<ResponseData>(this.baseUrl + relativeUrl, data, {
        ...this.httpOptions,

        ...(httpParams && { params: httpParams }),
      })
      .pipe(
        tap(
          // Log the result or error
          (value) => value,
          (error) => console.error(error)
        ),
        map((value: any) => value)
      );
  }

  protected PUT<T, V>(
    relativeUrl: string,
    data: V,
    params?: Object
  ): Observable<T> {
    const httpParams = this.buildParams(params);
    return this.http
      .put<ResponseData>(this.baseUrl + relativeUrl, data, {
        ...(httpParams && { params: httpParams }),
      })
      .pipe(
        tap(
          // Log the result or error
          (value) => value,
          (error) => console.error(error)
        ),
        map((value: ResponseData) => value.data)
      );
  }

  protected DELETE(
    relativeUrl: string,
    params?: Object
  ): Observable<ResponseData> {
    const httpParams = this.buildParams(params);
    return this.http
      .delete<ResponseData>(this.baseUrl + relativeUrl, {
        ...(httpParams && { params: httpParams }),
      })
      .pipe(
        tap(
          // Log the result or error
          (value) => value,
          (error) => console.error(error)
        ),
        map((value: ResponseData) => value.data)
      );
  }

  private buildParams(params) {
    let httpParams;

    if (params) {
      httpParams = new HttpParams();
      _.forEach(params, (V, K) => {
        if (_.isArray(V)) {
          _.forEach(V, (_V) => {
            httpParams = httpParams.append(K, _V);
          });
        } else {
          httpParams = httpParams.append(K, V);
        }
      });
    }

    return httpParams;
  }
}
