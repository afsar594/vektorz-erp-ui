import { Component, Input, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';

import html2canvas from 'html2canvas';
import jspdf from 'jspdf';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
  SelectItem,
} from 'primeng';
import { StationMaster } from 'src/app/routes/domain/StationMaster';
import { FileSaverService } from 'src/app/routes/service/FileSaverService/file-saver.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { ProformaInvoiceService } from 'src/app/routes/service/proformaInvoice/proforma-invoice.service';
import { PermissionsService } from 'src/app/shared/service/permissions.service';

@Component({
  selector: 'app-proforma-list',
  templateUrl: './proforma-list.component.html',
  styleUrls: ['./proforma-list.component.scss'],
})
export class ProformaListComponent implements OnInit {
  proformaForm: FormGroup;
  @Input() data: any;
  PIlist: any;
  displayPrintPreview: boolean = false;
  CustomerMasterArray: any[] = [];
  CustomerMasterArry: string[] = [];
  CustomerMasterList: SelectItem[];
  cols;
  stationmasterObj: StationMaster;
  filterArray: any;
  proformarry: any;
  constructor(
    private permission: PermissionsService,
    private PIService: ProformaInvoiceService,
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    private printService: FileSaverService,
    private utilityService: UtilityService,
    private masterapi: MasterApiService
  ) { }

  ngOnInit(): void {
    this.proformaForm = new FormGroup({
      LPONo: new FormControl('', Validators.required),
      dateTo: new FormControl(
        new Date(new Date().setFullYear(new Date().getFullYear())),
        Validators.required
      ),
      dateFrom: new FormControl(
        new Date(new Date().setFullYear(new Date().getFullYear())),
        Validators.required
      ),
      Search: new FormControl('', Validators.required),
      Customer: new FormControl(''),
      isDate: new FormControl(),
    });
    this.stationmasterObj = this.permission.getStation();


    this.cols = [
      { field: 'proformaInvoiceVoucherno', header: 'P.I No' },
      { field: 'proformaInvoiceDate', header: 'P.I Date' },

      { field: 'proformaInvoiceCustName', header: 'Customer Name' },
      { field: 'proformaInvoiceTotal', header: 'Grand Total' },
      { field: 'proformaInvoiceLpoNo', header: 'L.P.O No' },
      { field: 'action', header: 'Action' },
    ];

    this.LoadCustomerDDL();

  }
  LoadCustomerDDL() {
    this.utilityService.LoadCustomerDropdown().subscribe((m: any) => {
      this.CustomerMasterArray = m.resultSet.customerMasters;
      this.CustomerMasterList = m.resultSet.customerMasters?.map((kl) => ({
        label:
          kl.customerMasterCustomerReffAcNo != null
            ? kl.customerMasterCustomerName +
            ' -- ' +
            kl.customerMasterCustomerReffAcNo
            : kl.customerMasterCustomerName,
        value: kl.customerMasterCustomerNo,
      }));
      this.CustomerMasterList.unshift({
        label: '--Select Customer--',
        value: -1,
      });
    });
    this.getAllPI();
  }

  get f() {
    return this.proformaForm.controls;
  }

  displayPrint() {
    this.displayPrintPreview = true;
  }

  getAllPI() {
    this.PIService.getAllPI().subscribe((res) => {
      this.PIlist = res;
      this.filterArray = res;
    });
  }


  GetCustomer(id) {

    return this.CustomerMasterList?.find(
      (l) => l.value == id
    )?.label;

  }

  getPIList() {
    const fileName = String(new Date().valueOf());
    var data = document.getElementById('contentToConvertPI');
    html2canvas(data).then(async (canvas) => {
      var imgWidth = 208;
      var imgHeight = (canvas.height * imgWidth) / canvas.width;
      const contentDataURL = canvas.toDataURL('image/png');
      let pdf = new jspdf('p', 'mm', 'a4');
      var position = 0;
      pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
      // pdf.output('dataurlnewwindow');
      pdf.save('proformaInvoicePDF.pdf');
    });
  }

  getPIReport() {
    let html: any = document.getElementById('print');
    this.printService.saveAsPDF(html);
    this.userTrackingLog('PDF');
  }

  userTrackingLog(type) {
    let req = {
      page: 'Proforma Invoice list Printing',
      section: this.PIlist,
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: '',
      vpType: '',
    };
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => { });
  }

  close() {
    this.ref.close();
  }

  GetSavedPIDetails(id) {
    // alert(id);
    this.ref.close(id);
  }

  filter() {
    let filteredArray = this.filterArray;
    if (this.proformaForm.value.LPONo != null) {
      filteredArray = filteredArray?.filter(
        (res) =>
          Number(res.proformaInvoiceLpoNo) == this.proformaForm.value.LPONo
      );
    }

    if (this.proformaForm.value.Customer != null) {
      filteredArray = filteredArray?.filter(
        (res) =>
          Number(res.proformaInvoiceCustName) ==
          this.proformaForm.value.Customer
      );
    }
    if (this.proformaForm.value.isDate) {
      const fromDateStr = this.proformaForm.value.dateFrom;
      const toDateStr = this.proformaForm.value.dateTo; // Assuming toDate is part of the form

      const fromDate = new Date(fromDateStr);
      const toDate = new Date(toDateStr);

      // filteredArray = filteredArray?.filter((res) => {
      //   const voucherDate = new Date(res.purchaseVoucherPurchaseDate);

      //   voucherDate.setHours(0, 0, 0, 0);
      //   fromDate.setHours(0, 0, 0, 0);

      //   return voucherDate.getTime() >= fromDate.getTime() && voucherDate.getTime() <= toDate.getTime() || voucherDate.getTime() === fromDate.getTime();;
      // });

      filteredArray = filteredArray?.filter((res) => {
        const voucherDate = new Date(res.proformaInvoiceDate);
        const fromDate = new Date(fromDateStr); // Ensure fromDateStr is in a valid date format
        const toDate = new Date(toDateStr); // Ensure toDateStr is in a valid date format
        voucherDate.setHours(0, 0, 0, 0);
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(0, 0, 0, 0);
        return voucherDate >= fromDate && voucherDate <= toDate;
      });

      this.PIlist = filteredArray;
    }
    this.PIlist = filteredArray;
  }

  ClearFilter() {
    this.proformaForm.reset();
    this.PIlist = this.filterArray;
    this.proformaForm.get('dateFrom').setValue(new Date());
    this.proformaForm.get('dateTo').setValue(new Date());
  }
}
