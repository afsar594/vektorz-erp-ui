import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';
import { Table } from 'primeng/table';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-lookup',
  templateUrl: './lookup.component.html',
  styleUrls: ['./lookup.component.scss'],
})
export class LookupComponent implements OnInit {
  @Input() dataArry?: any[];
  @Input() tableheader?: string;
  @Input() header?: string;
  @Input() columns?: string[] = [];
  @Input() width?: string = '55vw';
  @Input() show?: boolean;
  @Input() selectedItem?: any; // Changed to 'any' to allow proper row selection
  @Input() formControlName?: AbstractControl = null;
  @Input() eleReference?: ElementRef = null;
  @Input() cell: { row?: number; column?: number } = {
    row: null,
    column: null,
  };
  @Input() info: { data?: any };
  @Output() selectItemEvent = new EventEmitter<any>();
  @Output() hideDialogEvent = new EventEmitter<boolean>();
  @Output() clearEvent = new EventEmitter<any>();
  @Output() exitEvent = new EventEmitter<boolean>();
  @Output() searchEvent = new EventEmitter<string>();
  @ViewChild('dt2') tableComponent: Table;
  @ViewChild('myInput', { static: false }) myInputField!: ElementRef;
  @Input() searchText: string | null = null; // Explicitly typed for clarity
  @Input() isServerSearch = false;
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;
  currentIndex = -1;
  constructor() {
    this.searchText = null;
  }

  ngOnInit(): void {
    this.searchSubscription = this.searchSubject
      .pipe(
        debounceTime(250),
        distinctUntilChanged()
      )
      .subscribe((value) => {
        if (this.isServerSearch) {
          this.onSearch(value);
        } else {
          const query = (value || '').trim();
          this.tableComponent?.filterGlobal(query, 'contains');
        }
      });
  }

  onInputChange(value: string) {
    this.searchSubject.next(value);
  }

  onSearch(value?: string) {
    this.currentIndex = -1;
    const query = value ?? this.searchText;
    if (this.isServerSearch) {
      this.searchEvent.emit(query);
    } else {
      this.tableComponent?.filterGlobal((query || '').trim(), 'contains');
    }
  }

  handleDialogShow() {
    this.currentIndex = -1;
    setTimeout(() => {
      // Blur any focused Handsontable cell
      if (document.activeElement?.classList.contains('handsontableInput')) {
        (document.activeElement as HTMLElement).blur();
      }
      // Focus the input
      if (this.myInputField?.nativeElement) {
        this.myInputField.nativeElement.focus();
      }
    }, 50);
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (this.dataArry && this.dataArry.length > 0) {
        this.tableComponent.selection = this.dataArry[this.currentIndex];
        this.selectedItem = this.dataArry[this.currentIndex];
        const tableElement = this.tableComponent.el.nativeElement.querySelector(
          '.p-datatable-wrapper'
        );
        if (tableElement) {
          tableElement.focus();
        }
      }
    }
  }
  onTableKeyDown(event: KeyboardEvent) {
    if ((!this.dataArry || this.dataArry.length === 0) && !this.selectedItem)
      return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (this.currentIndex < this.dataArry.length) {
        this.currentIndex += 1;
        this.selectedItem = this.dataArry[this.currentIndex];
        this.tableComponent.selection = this.selectedItem;
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (this.currentIndex > 0) {
        this.currentIndex -= 1;
        this.selectedItem = this.dataArry[this.currentIndex];
        this.tableComponent.selection = this.selectedItem;
      } else if (this.currentIndex === 0) {
        this.selectedItem = null;
        this.currentIndex -= 1;
        this.tableComponent.selection = null;
        if (this.myInputField?.nativeElement) {
          this.myInputField.nativeElement.focus();
        }
      }
    } else if (event.key === 'Enter' && this.selectedItem) {
      this.selectItem(this.selectedItem);
    }
  }

  selectItem(value: any) {
    this.Exit(true);
    this.selectItemEvent.emit(value);
  }

  Clear() {
    this.clearEvent.emit({
      elementRef: this.eleReference,
      formControl: this.formControlName,
      cell: this.cell,
    });
  }

  Exit(value: boolean) {
    this.tableComponent.reset();
    this.hideDialogEvent.emit(value);
    this.exitEvent.emit(true);
    this.searchText = null;
  }

  hideItem(value: boolean) {
    this.searchText = null;
    this.tableComponent.reset();
    this.hideDialogEvent.emit(value);
  }

  get keys() {
    if (this.dataArry?.length > 0) {
      return Object.keys(this.dataArry[0]);
    } else {
      return [];
    }
  }
  ngOnDestroy() {
    this.searchSubscription?.unsubscribe();
    this.searchSubject.complete();
  }
}
