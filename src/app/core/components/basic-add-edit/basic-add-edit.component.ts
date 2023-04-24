import {DatePipe} from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
// import { DataStateChangeEvent, GridDataResult } from '@progress/kendo-angular-grid';
// import { parseNumber } from '@progress/kendo-angular-intl';
// import { process, State, GroupDescriptor } from '@progress/kendo-data-query';
// import { HttpRequestService } from '../../services/common/http-request.service';
// import { ToastService } from 'src/services/common/toast.service';
import { ModalDismissReasons, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
// import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import {Router} from '@angular/router';
import {DxTooltipComponent, DxTooltipModule, DxPopupModule, DxToastModule} from 'devextreme-angular';
import {GroupDescriptor} from 'devextreme/data';
import DevExpress from 'devextreme';
import {DxDataGridModule} from 'devextreme-angular';
import {BaseService} from '../../../../services/common/http.service';
import {HttpClient} from '@angular/common/http';
import {parseNumber} from "devextreme/localization";
import {exportDataGrid} from "devextreme/pdf_exporter";
import {jsPDF} from 'jspdf';
import {custom} from "devextreme/ui/dialog";
import {ToastService} from "../../../../services/common/toast.service";

@Component({
  selector: 'app-basic-add-edit',
  templateUrl: './basic-add-edit.component.html',
  styleUrls: ['./basic-add-edit.component.sass'],
})
export class BasicAddEditComponent<T>
  extends BaseService
  implements OnInit, OnChanges {
  @ViewChild(DxTooltipModule) public tooltipDir: DxTooltipModule;
  //#region input output configurations
  @Input() configuration: BasicAddEditModel;
  @Output() onSaved = new EventEmitter<T>();
  @Output() onFormSubmit = new EventEmitter<T>();
  @Output() onDeleted = new EventEmitter<T>();

  @Output() addNew = new EventEmitter();
  @Output() addNewItemDropDownList = new EventEmitter();
  @Output() createUpdateDataExcel = new EventEmitter();
  @Output() editExisting = new EventEmitter<T>();
  @Input() saveTrigger: boolean;
  @Input() updateDropdownListAddNewItemTrigger: boolean;
  // @Input()
  // public groups: GroupDescriptor[];
  numberRegEx = /\-?\d*\.?\d{1,2}/;
  onlyNumberRegEx = /^\d*\.?\d*$/;
  closeResult: string;

  selectedItemKeys: any[] = [];
  isVisible = false;

  type = '';

  message = '';
  //#endregion

  //#region angular lifecycle hooks
   constructor(private httpClient: HttpClient, private toast: ToastService, private datePipe: DatePipe, private modalService: NgbModal, private router: Router) {
    super(httpClient);
    this.textInputType = InputType.text;
    this.textAreaInputType = InputType.textarea;
    this.checkBoxInputType = InputType.checkBox;
    this.colorPicker = InputType.colorPicker;
    this.radioButtonInputType = InputType.radioButton;
    this.dropDownInputType = InputType.dropDown;
    this.dropDownListAddNewItem = InputType.dropDownListAddNewItem;
    this.searchFiledInputType = InputType.searchFiled;
    this.multiSelectInputType = InputType.multiSelect;
    this.month = InputType.month;
    this.year = InputType.year;
    this.date = InputType.date;
    this.dateTime = InputType.datetime;

     // this.initAll();
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    // if(changes.cu)
    console.log(changes['configuration'].currentValue);
    if (changes['configuration'] && changes['configuration'].currentValue) {
      this.initAll();
      this.loadData();
    }
    if (
      changes['saveTrigger'] &&
      changes['saveTrigger'].currentValue !=
      changes['saveTrigger'].previousValue
    ) {
      this.displayAddEditForm = false;
      this.loadData();
      this.modalClose();
    }
    // if (changes['updateDropdownListAddNewItemTrigger'] && changes['updateDropdownListAddNewItemTrigger'].currentValue != changes['updateDropdownListAddNewItemTrigger'].previousValue) {
    //   this.updateDropDownListANI();
    // }
  }

  //#endregion

  //#region form initiation and clear
  selectedData: T;
  selectedIdForDelete: string;
  form: FormGroup;
  colorPicker: InputType;
  textInputType: InputType;
  textAreaInputType: InputType;
  checkBoxInputType: InputType;
  radioButtonInputType: InputType;
  dropDownInputType: InputType;
  dropDownListAddNewItem: InputType;
  searchFiledInputType: InputType;
  multiSelectInputType: InputType;
  date: InputType;
  dateTime: InputType;
  year: InputType;
  month: InputType;

  initAll() {
    // this.state.take = this.configuration.gridPageSize ? this.configuration.gridPageSize : 10;
    this.clearFields();
    this.initForm();
  }

  // OK
  toFormGroup() {
    if (
      this.configuration.hideAddEdit == undefined ||
      !this.configuration.hideAddEdit
    ) {
      if (this.configuration && this.configuration.columnDefinations) {
        const group: any = {};
        this.configuration.columnDefinations.forEach((c, iCol) => {
          if (
            c.inputType == InputType.text ||
            c.inputType == InputType.colorPicker ||
            c.inputType == InputType.textarea ||
            c.inputType == InputType.dropDown ||
            c.inputType == InputType.dropDownListAddNewItem ||
            c.inputType == InputType.searchFiled
          ) {
            if (
              c.inputType == InputType.dropDown &&
              c.parentField &&
              c.parentField.apiUrl &&
              c.parentField.apiUrl.length > 0
            ) {
              c.dropdownDataSource = [];
              group[c.fieldName] = c.isRequired
                ? new FormControl(undefined, Validators.required)
                : new FormControl(undefined);
              //this.dropdownValueChange(this.selectedData[c.fieldName], c.fieldName);
            } else {
              if (c.isRequired && c.isNumeric) {
                group[c.fieldName] = new FormControl(
                  this.selectedData[c.fieldName],
                  [Validators.required, Validators.pattern(this.numberRegEx)]
                );
              } else {
                if (c.inputType == InputType.dropDownListAddNewItem) {
                  this.paramDataInDDLAddNewItem[iCol] = <
                    DropDownListAddNewItemModel
                    >{
                    filter: '',
                    source: c.dropdownDataSource,
                    data: c.dropdownDataSource.slice(0),
                  };
                }
                group[c.fieldName] = c.isRequired
                  ? new FormControl(
                    this.selectedData[c.fieldName] || undefined,
                    Validators.required
                  )
                  : new FormControl(
                    this.selectedData[c.fieldName] || undefined
                  );
              }
            }
          } else if (c.inputType == InputType.multiSelect) {
            group[c.fieldName] = c.isRequired
              ? new FormControl(
                this.selectedData[c.fieldName] || [],
                Validators.required
              )
              : new FormControl(this.selectedData[c.fieldName] || []);
          } else if (
            c.inputType == InputType.checkBox ||
            c.inputType == InputType.radioButton
          ) {
            group[c.fieldName] = c.isRequired
              ? new FormControl(
                this.selectedData[c.fieldName] || false,
                Validators.required
              )
              : new FormControl(this.selectedData[c.fieldName] || false);
          } else if (c.inputType == InputType.month) {
            var today = new Date();
            group[c.fieldName] = c.isRequired
              ? new FormControl(
                this.selectedData[c.fieldName] || today,
                Validators.required
              )
              : new FormControl(this.selectedData[c.fieldName] || today);
          } else if (c.inputType == InputType.year) {
            var date = new Date();
            if (this.selectedData[c.fieldName]) {
              date = new Date(
                parseInt(this.selectedData[c.fieldName]),
                1,
                1,
                0,
                0,
                0,
                0
              );
            }
            group[c.fieldName] = c.isRequired
              ? new FormControl(date, Validators.required)
              : new FormControl(date);
            //debugger;
          } else if (c.inputType == InputType.date) {
            var today = new Date();
            group[c.fieldName] = c.isRequired
              ? new FormControl(
                this.selectedData[c.fieldName] || today,
                Validators.required
              )
              : new FormControl(this.selectedData[c.fieldName] || today);
          } else if (c.inputType == InputType.datetime) {
            var today = new Date();
            group[c.fieldName] = c.isRequired
              ? new FormControl(
                this.selectedData[c.fieldName] || today,
                Validators.required
              )
              : new FormControl(this.selectedData[c.fieldName] || today);
          }
          // else if(c.inputType == InputType.datepicker){
          //   group[c.fieldName] = c.isRequired ? new FormControl(this.selectedData[c.fieldName] || undefined, Validators.required)
          //   : new FormControl(this.selectedData[c.fieldName] || undefined);
          // }
        });
        console.log("group", group);
        return new FormGroup(group);
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  initForm() {
    console.log("hideAddEdit: ", this.configuration.hideAddEdit);
    if (!this.configuration.hideAddEdit) {
      this.form = this.toFormGroup();
      console.log("form: ", this.form);
      this.fireAllValueChange();
    }
    this.progressChecker();
    // this.form.valueChanges.subscribe(x => {
    //   this.progressChecker();
    // })
  }

  fireAllValueChange() {
    if (this.selectedData) {
      this.configuration.columnDefinations.forEach((d) => {
        this.dropdownValueChange(this.selectedData[d.fieldName], d.fieldName, true);
      });
    }
  }

  progressChecker() {
    if (this.configuration.toggleSection) {
      var filteredFields = this.configuration.columnDefinations.filter((x) => {
        return x.isDisplayInForm && x.isRequired;
      });
      var sections = [];

      filteredFields.forEach((x) => {
        var tempSection = sections.find((section) => {
          return section.name === x.sectionName;
        });
        if (tempSection != undefined) {
          var theSection = sections.find(
            (section) => section.name === x.sectionName
          );
          theSection.inputs.push(x);
        } else {
          sections.push({name: x.sectionName, inputs: [x]});
        }
      });

      sections.forEach((x) => {
        var counter = 0;
        for (var y in x.inputs) {
          if (
            this.form.controls[x.inputs[y].fieldName].value !== null &&
            this.form.controls[x.inputs[y].fieldName].value !== ''
          ) {
            counter = counter + 1;
          }
        }
        if (counter < x.inputs.length) {
          this.configuration.toggleSection.forEach((z) => {
            if (z.sectionName == x.name) {
              z['isCompleted'] = false;
            }
          });
        } else {
          this.configuration.toggleSection.forEach((z) => {
            if (z.sectionName == x.name) {
              z['isCompleted'] = true;
            }
          });
        }
      });
    }
  }

  clearFields() {
    this.selectedData = <T>{};
    this.displayAddEditForm = false;
    this.displayDeleteDialog = false;
    this.canAddEdit = false;
    this.canDelete = false;
  }

  //#endregion

  //#region for download or upload excel
  excelFileUploaded: File;

  // downloadTemplateExcel() {
  //   this.http.downLoadFile(this.configuration.urlDownloadExcel, { responseType: 'blob' }).subscribe((response: any) => {
  //     let dataType = response.type;
  //     let binaryData = [];
  //     let downloadLink = document.createElement('a');
  //     binaryData.push(response);
  //     downloadLink.href = window.URL.createObjectURL(new Blob(binaryData, { type: dataType }));
  //     if (this.configuration.excelFileName) {
  //       downloadLink.setAttribute('download', this.configuration.excelFileName);
  //     }
  //     document.body.appendChild(downloadLink);
  //     downloadLink.click();
  //   });
  // }

  handleFiles(event) {
    this.excelFileUploaded = event.target.files.item(0);
  }

  // toBulkUpload() {
  //   if (!this.configuration.disableCreateUpdateDataExcel) {
  //     const formData: FormData = new FormData();
  //     formData.append('File', this.excelFileUploaded);
  //
  //     this.http.uploadFile(this.configuration.urlCreateUpdateDataExcel, formData).subscribe(d => {
  //       this.toast.success('Upload successful!');
  //       this.router.navigate([this.configuration.urlRedirectAfterUploadExcel], { state: d });
  //     }, e => {
  //       this.toast.error("Upload failed!")
  //     });
  //
  //   } else {
  //     this.createUpdateDataExcel.emit(this.excelFileUploaded);
  //   }
  // }
  //#endregion

  //#region DropDownListAddNewItem setup
  paramDataInDDLAddNewItem: DropDownListAddNewItemModel[] = [];

  addNewDDLANI(iCol, fieldName): void {
    let filter = this.paramDataInDDLAddNewItem[iCol].filter;
    if (!this.configuration.disableAddNewOnDropDownList) {
      this.post<any>(this.configuration.saveApiUrlOnDropDownList, {name: filter}).subscribe(d => {
        this.updateDropDownListANI();
      });
    } else {
      this.addNewItemDropDownList.emit(<resModelDropDownListAddNewItem>{fieldName, value: filter});
    }
    this.handleFilterOnDDLANI(filter, iCol);
  }

  handleFilterOnDDLANI(value, iCol) {
    if (this.paramDataInDDLAddNewItem[iCol].filter && !value.trim() || value.trim()) {
      this.paramDataInDDLAddNewItem[iCol].filter = value;
      this.paramDataInDDLAddNewItem[iCol].data = this.paramDataInDDLAddNewItem[iCol].source.filter(
        (s) => s[this.configuration.columnDefinations[iCol].dropdownValueColumnName].toLowerCase().indexOf(value.toLowerCase()) !== -1
      );
    }

  }

  updateDropDownListANI() {
    this.configuration.columnDefinations.forEach((col, index) => {
      if (col.inputType == InputType.dropDownListAddNewItem && col.getAllApiUrl) {
        this.get<any>(col.getAllApiUrl).subscribe(d => {
          col.dropdownDataSource = d.data;
          this.paramDataInDDLAddNewItem[index].source = col.dropdownDataSource;
          this.handleFilterOnDDLANI(this.paramDataInDDLAddNewItem[index].filter, index);
        }, e => {
        });
      }
    });
  }

  //#endregion

  //#region grid setup
  dataList: any[] = [];
  isGridLoding: boolean;
  isGroupable: boolean = false;
  // public state: State = {
  //   skip: 0,
  //   take: 10,
  // };

  // public gridData: DxDataGridModule = process(this.dataList, this.state);
  public gridData: DxDataGridModule = this.dataList;

  // public dataStateChange(state: DataStateChangeEvent): void {
  //   this.state = state;
  //   this.gridData = process(this.dataList, this.state);
  // }
  //
  // public groupChange(groups: GroupDescriptor[]): void {
  //   this.groups = groups;
  //   this.gridData = process(this.dataList, { group: this.groups });
  // }
  //
  // public excelData = () => {
  //   return process(this.dataList, {
  //     filter: this.state.filter
  //   });
  // }

  //#endregion

  //#region add edit options
  displayAddEditForm: boolean = false;
  displayDeleteDialog: boolean = false;
  canAddEdit: boolean = false;
  canDelete: boolean = false;

  onAddNew(event, modal) {
    console.log("Clicked on Add New");
    if (!this.configuration.hideAddEdit) {
      this.initAll();
      setTimeout(() => {
        this.displayAddEditForm = true;
        this.open(modal);
      }, 100);
    } else {
      this.addNew.emit();
    }
  }

  onEdit(event, data, modal) {
    console.log('Clicked on edit button' + JSON.stringify(data.row.data));
    if (!this.configuration.hideAddEdit) {
      if (this.configuration && this.configuration.keyFieldName) {
        this.selectedData = data.row.data;
        this.getById(data.row.data[this.configuration.keyFieldName], modal);
      }
    } else {
      this.editExisting.emit(data);
    }
  }

  logEvent(eventName) {
    console.log(eventName);
  }

  allowDeleting(e) {
    // return e.row.rowIndex % 2 === 1;
  }

  onExporting(e) {
    const doc = new jsPDF();
    exportDataGrid({
      jsPDFDocument: doc,
      component: e.component,
      indent: 5,
    }).then(() => {
      doc.save('Companies.pdf');
    });
  }

  onDelete1(event, data) {
    ////debugger;
    console.log('Clicked on delete button' + event + JSON.stringify(data.row.data));
    if (this.configuration && this.configuration.keyFieldName) {
      this.selectedData = data.row.data;
      this.selectedIdForDelete = data.row.data[this.configuration.keyFieldName];
      this.displayDeleteDialog = true;
    } else {
      this.toast.error('no data found for delete.');
    }
  }

  closeAddEdit() {
    this.displayAddEditForm = false;
    this.modalClose();
  }

  closeDeleteDialog() {
    this.selectedIdForDelete = '';
    this.displayDeleteDialog = false;
  }

  //#endregion

  //#region load data

  loadData() {
    if (this.configuration) {
      this.isGridLoding = true;
      // this.gridData = this.countries;
      this.get<any>(this.configuration.getAllApiUrl).subscribe(
        (d: any) => {
          console.log("response: ", d);
          this.dataList = d;
          this.isGridLoding = false;
          this.isGroupable = this.configuration.isGroupable;
          if (this.configuration.groupField) {
            // this.groups = [{ field: this.configuration.groupField }]
            // this.gridData = process(this.dataList, { group: this.groups });
            this.gridData = this.dataList;
          } else {
            // this.gridData = process(this.dataList, this.state);
            this.gridData = this.dataList;
          }
        },
        (error) => {
          this.isGridLoding = false;
          console.log(error);
          if (this.configuration) {
            this.toast.error(
              'Failed to fetch data for ' + this.configuration.name
            );
          }
        }
      );
    } else {
      if (this.configuration) {
        this.toast.warning(
          'Invalid configuration for ' + this.configuration.name
        );
      }
    }
  }

  getById(id: string, modal) {
    var obj = {Id: id};
    this.getByApiUrl<any>(this.configuration.getByApiUrl, obj.Id).subscribe(
      (d) => {
        this.selectedData = d;
        console.log("selected data: ", d);
        this.initForm();
        this.displayAddEditForm = true;
        this.open(modal);
      },
      (e) => {
        console.log(e);
        this.toast.error('Cannot fetch data for display');
      }
    );
  }

  //#endregion

  // public allCollapseToggle(grid: any): void {
  //   for (let i = this.state.skip; i < this.state.skip + this.state.take; i++) {
  //     grid.collapseGroup(i.toString());
  //   }
  // }

  public showTooltip(e: MouseEvent): void {
    const element = e.target as HTMLElement;
    if (
      (element.nodeName === 'TD' ||
        element.nodeName === 'TH' ||
        element.nodeName == 'SPAN') &&
      element.offsetWidth < element.scrollWidth
    ) {
      // this.tooltipDir.toggle(element);
    } else {
      // this.tooltipDir.hide();
    }
  }

  onShown() {
  }

  // #region data submission
  onSubmit() {

    //#region only numeric allowed on numeric fields
    this.configuration.columnDefinations.forEach(d => {
      if (d.onlyNumber && d.inputType == InputType.text && d.isDisplayInForm && this.form.value[d.fieldName]) {
        this.form.value[d.fieldName] = (<HTMLInputElement>document.querySelector(`.${d.fieldName} input`)).value;
      }
    });
    //#endregion
    //
    //   //#region manage numeric
    this.configuration.columnDefinations.forEach(d => {
      if (d.isNumeric && this.form.value[d.fieldName]) {
        var y = parseNumber(this.form.value[d.fieldName], "0.0");
        this.form.value[d.fieldName] = y;
      }
    });
    //   //#endregion
    //
    //   //#region manage year
    this.configuration.columnDefinations.forEach(d => {
      if (d.inputType == InputType.month && this.form.value[d.fieldName]) {
        var y = new Date(this.form.value[d.fieldName]).getMonth() + 1;
        this.form.value[d.fieldName] = y;
      }
    });
    //   //#endregion
    //
    //   //#region manage year
    this.configuration.columnDefinations.forEach(d => {
      if (d.inputType == InputType.year && this.form.value[d.fieldName]) {
        var y = new Date(this.form.value[d.fieldName]).getFullYear();
        this.form.value[d.fieldName] = y;
      }
    });
    //   //#endregion
    //
    //   //#region manage date
    this.configuration.columnDefinations.forEach(d => {
      if (d.inputType == InputType.date && this.form.value[d.fieldName]) {
        //var y = this.datePipe.transform(new Date(this.form.value[d.fieldName]), 'dd-MMM-yyyy');
        var y = new Date(this.form.value[d.fieldName]);
        this.form.value[d.fieldName] = y;
      }
    });
    //   //#endregion
    //
    //   //#region manage date time
    this.configuration.columnDefinations.forEach(d => {
      if (d.inputType == InputType.datetime && this.form.value[d.fieldName]) {
        //var y = this.datePipe.transform(new Date(this.form.value[d.fieldName]), 'dd-MMM-yyyy hh:mm:ss a');
        var y = new Date(this.form.value[d.fieldName]);
        this.form.value[d.fieldName] = y;
      }
    });
    //   //#endregion
    //
    this.touchAllFields();
    console.log("form valid: ", this.form.valid);
    if (this.form.valid) {
      var param = this.form.value;
      console.log("param: ", param);
      if (!param.id) {
        delete param.id;
      }
      if (!param.batteryTypeParentId) {
        delete param.batteryTypeParentId;
      }

      if (!this.configuration.disableAutoSave) {
        this.post<any>(this.configuration.saveApiUrl, param).subscribe(d => {
          this.displayAddEditForm = false;
          this.toast.success("Data saved succesfully.");
          this.loadData();
          this.onSaved.emit(d.data);
          this.modalClose();
        }, e => {
          //this.displayAddEditForm = false;
          this.toast.error("Failed to save changes.");
          console.log(e);
        })
      } else {
        this.onFormSubmit.emit(param);
      }


    } else {
      this.toast.error("Please fillup the mendatory fields");
    }
  }

  deleteData() {
    //use this id for delete.
    //this.selectedIdForDelete;
    //debugger;
    console.log("delete data id: ", this.selectedIdForDelete);
    if (this.configuration && this.configuration.deleteApiUrl) {
      var request = {
        id: this.selectedIdForDelete
      }
      this.delete(this.configuration.deleteApiUrl, request.id).subscribe(d => {
        this.type = 'success';
        this.message = "Data deleted successfully.";
        this.isVisible = true;
        this.displayDeleteDialog = false;
        this.clearFields();
        this.loadData();
        this.onDeleted.emit(d.data);
      }, e => {
        console.log(e);
        this.type = 'error';
        this.message = "Failed to delete data";
        this.isVisible = true;
      })
    }
  }

  touchAllFields() {
    Object.keys(this.form.controls).forEach((field) => {
      const control = this.form.get(field);
      control.markAsTouched({onlySelf: true});
    });
  }

  modalRef: NgbModalRef;

  modalClose() {
    this.modalRef.close('Closed After Saving');
  }

  open(content) {
    this.modalRef = this.modalService.open(content, { size: this.configuration.dialogWidth, centered: true, scrollable: true, backdrop: 'static', ariaLabelledBy: 'modal-basic-title' });
    this.modalService.open(content , {size: this.configuration.dialogWidth,  centered: true, scrollable: true, backdrop: 'static', ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  dropdownValueChange(value, fieldName, isInit: boolean) {
    this.configuration.columnDefinations.forEach(element => {
      if (element.parentField && element.parentField.fieldName == fieldName) {
        this.get<any[]>(element.parentField.apiUrl + value).subscribe(d => {
            //debugger;
            element.dropdownDataSource = d;
            if (this.selectedData[element.fieldName]) {
              var isExist = false;
              if (isInit) {
                d.forEach(v => {
                  if (this.selectedData[element.fieldName] == v[element.dropdownKeyColumnName]) {
                    isExist = true;
                    return;
                  }
                });
              }
              if (isExist) {
                this.form.get(element.fieldName).setValue(this.selectedData[element.fieldName]);
              } else {
                this.form.get(element.fieldName).setValue(undefined);
              }
            } else {
              this.form.get(element.fieldName).setValue(undefined);
            }
            //reset the value here....
            //debugger;
          },
          e => {

          });
      }
    });
  }

  //#endregion

  selectionChanged(data: any) {
    this.selectedItemKeys = data.selectedRowKeys;
  }

  onDelete(event, data) {
    this.selectedIdForDelete = data.row.data.id;
    let customDeleteConfirmDialog = custom({
      showTitle: false,
      messageHtml: "Are you really want to delete this record?",
      buttons: [
        {
          text: "Yes",
          onClick: () => true
        },
        {
          text: "No",
          onClick: () => false
        }
      ]
    });

    customDeleteConfirmDialog.show().then((dialogResult) => {
      console.log("Dialog Result: ", dialogResult);
      if (dialogResult) {
        console.log("selected Item: ", this.selectedIdForDelete);
        this.deleteData();
        // this.selectedItemKeys.forEach((key) => {
        //   // this.dataSource.remove(key);
        //   console.log("Pressed Yes");
        // });
        // this.dataGrid.instance.refresh();
      }
    });
  }

}

//#region interfaces
// export interface ReloadGrid{
//   isReload: boolean;
// }


export interface DropDownListAddNewItemModel {
  filter: string;
  source: any[];
  data: any[];
}

export interface BasicAddEditModel {
  name: string;
  keyFieldName: string;
  dialogWidth: string;
  totalColumns: number;
  getAllApiUrl: string;
  getByApiUrl?: string;
  saveApiUrl?: string;
  deleteApiUrl?: string;
  isAddEnabled?: boolean;
  isEditEnabled?: boolean;
  hideAddEdit?: boolean;
  isDeleteEnabled?: boolean;
  isExcelExportEnable?: boolean;
  haveBulkUpload?: boolean;
  isPDFExportEnabled?: boolean;
  gridPageSize?: number;
  isGroupable?: boolean;
  groupField?: string;
  disableAutoSave?: boolean;
  columnDefinations?: BasicAddEditColumnDefination[];
  toggleSection?: toggleSection[];
  columnHealth?: any[];
  saveApiUrlOnDropDownList?: string;
  disableAddNewOnDropDownList?: boolean;
  urlDownloadExcel?: string;
  urlCreateUpdateDataExcel?: string;
  disableCreateUpdateDataExcel?: boolean;
  excelFileName?: string;
  urlRedirectAfterUploadExcel?: string;
}

export interface BasicAddEditColumnDefination {
  fieldName: string;
  caption: string;
  gridWidth: number;
  isDisplayInGrid?: boolean;
  displayOrder?: number;
  isGridColumnFixed?: boolean;
  haveBulkUpload?: boolean;
  isDisplayInForm?: boolean;
  isReadOnly?: boolean;
  isRequired?: boolean;
  isNumeric?: boolean;
  requiredValidationMessage?: string;
  inputType?: InputType;
  dropdownDataSource?: any[];
  dropdownKeyColumnName?: string;
  dropdownValueColumnName?: string;
  parentField?: parentFiled;
  textAreaRowsNo?: number;
  checkBoxYesValue?: string;
  checkBoxNoValue?: string;
  searchApiUrl?: string;
  datepickerValue?: Date;
  datepickerMinValue?: Date;
  datepickerMaxValue?: Date;
  sectionName?: string;
  getAllApiUrl?: string;
  onlyNumber?: boolean;
}

export interface parentFiled {
  fieldName: string;
  apiUrl: string;
}

export interface toggleSection {
  sectionName: string;
  description: string;
  link: string;
  isCompleted: boolean;
}

export interface columnHealth {
  name: string;
  items: any[];
}

export interface resModelDropDownListAddNewItem {
  fieldName: string;
  value: string;
}

// export interface BasicDropDownModel{
//   key: string;
//   value: string;
// }
export enum InputType {
  text,
  textarea,
  checkBox,
  radioButton,
  dropDown,
  dropDownListAddNewItem,
  searchFiled,
  multiSelect,
  colorPicker,
  month,
  year,
  date,
  datetime,
}

//#endregion
