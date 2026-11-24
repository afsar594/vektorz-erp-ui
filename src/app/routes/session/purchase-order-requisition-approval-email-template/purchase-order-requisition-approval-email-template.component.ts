import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiResponse } from 'src/app/routes/domain/ApiResponse';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-purchase-order-requisition-approval-email-template',
  template: `
    <p
      style=" display: flex;  justify-content: center;    align-items: center;        height: 100vh; 
  text-align: center;"
      *ngIf="!showDialog && !showMessageDialog"
    >
      <strong>{{ message }}</strong>
    </p>

    <!-- Rejection Reason Dialog -->
    <p-dialog
      header="Rejection Reason"
      [(visible)]="showDialog"
      [modal]="true"
      [closable]="false"
      [baseZIndex]="10000"
      [style]="{ width: '400px' }"
    >
      <div class="p-fluid">
        <label for="reason">Please enter the reason for rejection:</label>
        <textarea
          id="reason"
          rows="4"
          [(ngModel)]="rejectionReason"
          pInputTextarea
          autoResize
        ></textarea>
      </div>
      <p-footer>
        <button
          pButton
          label="Submit"
          (click)="submitRejectionReason()"
          class="p-button-danger"
          [disabled]="!rejectionReason.trim()"
        ></button>
      </p-footer>
    </p-dialog>

    <!-- Message Popup Dialog -->
    <p-dialog
      header="Notice"
      [(visible)]="showMessageDialog"
      [modal]="true"
      [closable]="false"
      [baseZIndex]="10001"
      [style]="{ width: '400px' }"
    >
      <div class="p-d-flex p-jc-center p-ai-center" style="padding: 1rem;">
        <p>{{ message }}</p>
      </div>
      <p-footer>
        <button
          pButton
          label="OK"
          (click)="closeMessageDialog()"
          autofocus
        ></button>
      </p-footer>
    </p-dialog>
  `,
})
export class PurchaseOrderRequisitionApprovalEmailTemplateComponent
  implements OnInit
{
  message = 'Processing your request...';
  showDialog = false;
  showMessageDialog = false;
  rejectionReason = '';
  token = '';
  headers = new HttpHeaders();

  payload = {
    approverLevel: ApproverLevels.None,
    orderId: 0,
    orderType: OrderForms.None,
    jobId: 0,
    approvalStatus: 0,
    userId: 0,
    remarks: '',
  };

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;

    this.token = params.get('token') || '';
    const orderTypeParam = params.get('orderType');
    const approverLevelParam = params.get('approverLevel');

    this.payload = {
      approverLevel:
        ApproverLevels[approverLevelParam as keyof typeof ApproverLevels],
      orderId: +params.get('orderId')!,
      orderType: OrderForms[orderTypeParam as keyof typeof OrderForms],
      jobId: +params.get('jobId')!,
      approvalStatus: +params.get('approvalStatus')!,
      userId: +params.get('userId')!,
      remarks: '',
    };

    this.headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.token}`,
    });

    this.checkIsAlreadyApprovedOrRejected();
  }

  submitRejectionReason() {
    if (!this.rejectionReason.trim()) return;
    this.payload.remarks = this.rejectionReason.trim();
    this.showDialog = false;
    this.submitRequest();
  }

  submitRequest() {
    this.http
      .post(
        `${environment.apiRootURL}PurchaseOrder/ApprovePOPR`,
        this.payload,
        { headers: this.headers }
      )
      .subscribe({
        next: () => {
          this.message = 'Your action was completed successfully.';
          this.closeWindow();
        },
        error: (err) => {
          this.message = `Error: ${err.message}`;
          this.showMessageDialog = true;
        },
      });
  }

  checkIsAlreadyApprovedOrRejected() {
    this.http
      .post<ApiResponse<string>>(
        `${environment.apiRootURL}PurchaseOrder/IsAlreadyApprovedOrRejected`,
        this.payload,
        { headers: this.headers }
      )
      .subscribe((res) => {
        if (res.valid) {
          this.message =
            res.message || 'This request has already been processed.';
          this.showMessageDialog = true;
        } else {
          this.message = 'Processing your request...';

          if (this.payload.approvalStatus === 3) {
            this.showDialog = true;
          } else {
            this.submitRequest();
          }
        }
      });
  }

  closeMessageDialog() {
    this.showMessageDialog = false;
    this.closeWindow();
  }

  closeWindow() {
    setTimeout(() => {
      try {
        window.close();
        if (!window.closed) {
          window.location.href = '/thank-you'; // fallback if not popup
        }
      } catch {
        window.location.href = '/thank-you';
      }
    }, 3000); // 5000 ms = 5 seconds
  }
}

export enum OrderForms {
  None = 0,
  PurchaseOrder = 1,
  PurchaseRequisition = 2,
  BillOfQuantity = 3,
  SalesOrder = 4,
  CustomerQuotation = 5,
  GeneralPurchaseOrder = 6,
}

export enum ApproverLevels {
  None,
  Level1,
  Level2,
  Level3,
}
