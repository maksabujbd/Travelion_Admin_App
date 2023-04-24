import { Component } from '@angular/core';
import {
  BasicAddEditModel,
  InputType,
} from 'src/app/core/components/basic-add-edit/basic-add-edit.component'

@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.scss'],
})
export class CountryComponent {
  customConfiguration: BasicAddEditModel;

  loadData() {
    this.customConfiguration = <BasicAddEditModel>(<unknown>{
      name: 'Country',
      keyFieldName: 'id',
      dialogWidth: 'md',
      totalColumns: 1,
      getAllApiUrl: 'api/country',
      getByApiUrl : "api/country",
      deleteApiUrl: "api/country",
      saveApiUrl: "api/Country",
      isAddEnabled: true,
      isEditEnabled: true,
      isDeleteEnabled: true,
      isExcelExportEnable: true,
      isPDFExportEnabled: true,
      gridPageSize: 20,
      hideAddEdit: false,
      disableAutoSave:false,
      columnDefinations: [
        {
          fieldName: 'countryName',
          caption: 'Country Name',
          gridWidth: 50,
          inputType: InputType.text,
          isDisplayInGrid: true,
          isDisplayInForm: true,
          isRequired: true,
          isGridColumnFixed: true,
        },
        {
          fieldName: 'countryCode',
          caption: 'Country Code',
          gridWidth: 30,
          inputType: InputType.text,
          isDisplayInGrid: true,
          isDisplayInForm: true,
          isRequired: true,
          isGridColumnFixed: true,
        },
      ],
    });
  }

  ngOnInit() {
    // document.getElementById('currentRoute').innerHTML = 'country';
    this.loadData();
  }
}
