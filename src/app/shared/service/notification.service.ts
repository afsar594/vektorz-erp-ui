import { Injectable, HostListener } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from 'src/environments/environment';
import { MessageService } from 'primeng/api';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { Router } from '@angular/router';
import { LocalStorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {

  private hubConnection!: signalR.HubConnection;
  private readonly hubEndpoint = 'notifications';

  notifications: Notification[] = [];
  unreadCount = 0;
  notificationsVisible = false;

  constructor(
    private messageService: MessageService,
    private masterApi: MasterApiService,
    private router: Router,
    private local: LocalStorageService
  ) {}

  /* ===================== UI ===================== */

  toggleNotifications(event: Event): void {
    event.stopPropagation();
    this.notificationsVisible = !this.notificationsVisible;
  }

  @HostListener('document:click')
  closeOnOutsideClick(): void {
    this.notificationsVisible = false;
  }

  onNotificationSelected(event: any): void {
    if (event?.value) {
      this.openNotification(event.value);
    }
  }



  clearNotifications(): void {
    this.masterApi.markAllNotificationAsReaded(this.notifications).subscribe((res: any) => {
      if (res?.valid) {
        this.messageService.add({
          severity: 'success',
          summary: 'Notifications',
          detail: 'All notifications marked as read'
        });
        this.notifications = [];
        this.unreadCount = 0;
        this.notificationsVisible = false;
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Notifications',
          detail: 'Failed to mark notifications as read'
        });
      }
    });
  }




  
  openNotification(note: Notification): void {
    note.isRead = true;
    this.updateUnreadCount();

    if (note.routeUrl) {
      this.router.navigate([note.routeUrl]);
    }

    this.notifications = this.notifications.filter(
      n => n.notificationId !== note.notificationId
    );

    this.masterApi.markNotificationAsReaded(note).subscribe();
  }

  /* ===================== API ===================== */

  getNotifications(): void {
    this.masterApi.getNotifications().subscribe((res: any) => {
      if (res?.valid && res.result) {
        this.notifications = res.result;
        this.updateUnreadCount();
      }
    });
  }

  /* ===================== SignalR ===================== */

  async connect(): Promise<void> {
    if (!this.hubConnection) {
      this.initConnection();
    }

    if (this.hubConnection.state === signalR.HubConnectionState.Disconnected) {
      try {
        await this.hubConnection.start();
        this.registerHandlers();
        console.log('✅ Notification hub connected');
      } catch (err) {
        this.messageService.add({
          severity: 'error',
          summary: 'SignalR',
          detail: 'Failed to connect notification service'
        });
      }
    }
  }

  private initConnection(): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.buildHubUrl(), {
        accessTokenFactory: () =>
          JSON.parse(localStorage.getItem('token') || '""')
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();
  }

  private registerHandlers(): void {

    this.hubConnection.onreconnected(() => {
      console.log('🔁 Reconnected to notification hub');
    });

    this.hubConnection.on('ReceiveNotification', (payload: string) => {
      const note: Notification = JSON.parse(payload);

      this.notifications.unshift(note);
      this.updateUnreadCount();

      this.showToast(note);
      this.showBrowserNotification(note);
    });
  }

  async disconnect(): Promise<void> {
    if (this.hubConnection?.state !== signalR.HubConnectionState.Disconnected) {
      await this.hubConnection.stop();
    }
  }

  /* ===================== Helpers ===================== */

  private updateUnreadCount(): void {
    this.unreadCount = this.notifications.filter(n => !n.isRead).length;
  }

  private showToast(note: Notification): void {
    if (note.message) {
      this.messageService.add({
        severity: 'success',
        summary: 'New Notification',
        detail: note.message
      });
    }
  }

  private showBrowserNotification(note: Notification): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      const n = new Notification('New Notification', {
        body: note.message,
        icon: '/assets/notification-icon.png'
      });

      n.onclick = () => {
        window.focus();
        if (note.routeUrl) {
          this.router.navigate([note.routeUrl]);
        }
      };
    }
  }

  private buildHubUrl(): string {
    return `${environment.apiRootURL.replace('/api', '')}${this.hubEndpoint}`;
  }
}

export interface Notification {
  notificationId: number;
  message: string;
  routeUrl: string;
  isRead: boolean;
}
