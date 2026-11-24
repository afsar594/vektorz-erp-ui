import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { ExportdocumentService } from 'src/app/routes/service/ExportDocument/exportdocument.service';

@Component({
  selector: 'app-pdcalert',
  templateUrl: './pdcalert.component.html',
  styleUrls: ['./pdcalert.component.scss'],
})
export class PdcalertComponent implements OnInit {
  title: string;
  subtitle: string;
  PDCPostedList: any[] = [];
  PDCPostedListDuplicate: any[] = [];
  PDCList: any[] = [];
  PDCListDuplicate: any[] = [];
  PDCForm: FormGroup;
  index: number = 0;
  handleChange(e) {
    this.index = e.index;
  }

  searchTerm: string = ''; // Search term for filtering
  dateFrom: Date | null = null; // Start date for filtering
  dateTo: Date | null = null;

  constructor(
    private activatedroute: ActivatedRoute,
    public accountService: AccountApiService,
    private exportDocument: ExportdocumentService
  ) {}

  ngOnInit(): void {
    this.GetPDCGetList();
    this.GetPDCPostedList();

    this.PDCForm = new FormGroup({
      DateTO: new FormControl(new Date()),
      DateFrom: new FormControl(new Date()),
    });
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
      this.subtitle = data.title;
    });
  }

  get f() {
    return this.PDCForm.controls;
  }

  Print() {
    if (this.index == 0) {
      this.exportDocument.PrintPDF('print', '');
    } else {
      this.exportDocument.PrintPDF('print1', '');
    }
  }

  Export2Excel() {
    if (this.index == 0) {
      this.exportDocument.ExportToDocument('print', 'PDC Alert', '.xlsx');
    } else {
      this.exportDocument.ExportToDocument('print1', 'PDC Alert', '.xlsx');
    }
  }

  calculateDays(transDate) {
    let currentDate = new Date();
    transDate = new Date(transDate);
    var days = Math.floor(
      (Date.UTC(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate()
      ) -
        Date.UTC(
          transDate.getFullYear(),
          transDate.getMonth(),
          transDate.getDate()
        )) /
        (1000 * 60 * 60 * 24)
    );
    return days;
  }

  GetPDCGetList() {
    this.accountService.GetPDCGetList().subscribe((k: any) => {
      this.PDCPostedList = k;
      this.PDCPostedListDuplicate = k;
    });
  }

  GetPDCPostedList() {
    this.accountService.PDCissuedLists().subscribe((k: any) => {
      this.PDCList = k;
      this.PDCListDuplicate = k;
    });
  }

  getTotal() {
    return this.PDCPostedList.reduce(
      (sum, current) => sum + current.cAmount,
      0
    );
  }

  getPDCIssueTotal() {
    return this.PDCList.reduce((sum, current) => sum + current.cAmount, 0);
  }

  onClickSearch() {
    this.PDCList = this.filteredPDCList;
    this.PDCPostedList = this.filteredPDCPostedList;
  }

  onSearch(value: string) {
    this.searchTerm = value.toLowerCase();
  }

  get filteredPDCPostedList() {
    return this.PDCPostedList?.filter((item) => {
      const itemDate = new Date(item.tDate);
      const matchesSearch =
        item.vno.toLowerCase().includes(this.searchTerm) ||
        item.cbName.toLowerCase().includes(this.searchTerm) ||
        item.accName.toLowerCase().includes(this.searchTerm);

      const matchesDate =
        (!this.dateFrom || itemDate >= this.dateFrom) &&
        (!this.dateTo || itemDate <= this.dateTo);

      return matchesSearch && matchesDate;
    });
  }

  get filteredPDCList() {
    return this.PDCList?.filter((item) => {
      const itemDate = new Date(item.tDate);
      const matchesSearch =
        item.vno.toLowerCase().includes(this.searchTerm) ||
        item.cbName.toLowerCase().includes(this.searchTerm) ||
        item.accName.toLowerCase().includes(this.searchTerm);

      const matchesDate =
        (!this.dateFrom || itemDate >= this.dateFrom) &&
        (!this.dateTo || itemDate <= this.dateTo);

      return matchesSearch && matchesDate;
    });
  }
}
