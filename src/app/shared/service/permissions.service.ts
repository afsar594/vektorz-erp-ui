import { Injectable } from '@angular/core';
import { LocalStorageService } from './storage.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class PermissionsService {
  public secretkey: any;
  constructor(private _local: LocalStorageService, private router: Router) {}
  list = this._local.get('List');

  getById(key: any) {
    const groupId = this._local.get('groupId');
    const encryptedList = this._local.get('List');
    if (Object.keys(encryptedList).length > 0 && groupId > 0) {
      const decryptedList = this.decryptData(encryptedList);
      const filteredList = decryptedList?.filter(
        (a) =>
          a.workGroupPermissionsMenuId == key &&
          a.workGroupPermissionsWorkGroupId == groupId
      );
      return filteredList;
    } else {
      // this.router.navigate(['/login']);
    }
  }
  encryptData(data: any): string {
    const key = this._local.get('token');
    if (Object.keys(key).length > 0) {
      const secretKey = key;
      const encryptedData = btoa(JSON.stringify(data) + secretKey);
      return encryptedData;
    } else {
      this.router.navigate(['/login']);
    }
  }
  decryptData(encryptedData: string): any {
    const key = this._local.get('token');
    if (key && typeof key === 'string' && key.length > 0) {
      try {
        const decryptedData = atob(encryptedData);
        let data;
        if (decryptedData.includes(key)) {
          data = decryptedData.substring(0, decryptedData.lastIndexOf(key));
        } else {
          data = decryptedData.replace(key, '');
        }
        return JSON.parse(data);
      } catch (error) {
        // this.router.navigate(['/login']);
      }
    } else {
      // this.router.navigate(['/login']);
    }
  }

  getUser() {
    const encryptedUser = this._local.get('Login');
    if (Object.keys(encryptedUser).length > 0) {
      const decryptedstation = this.decryptData(encryptedUser);
      return decryptedstation;
    }
  }
  getStation() {
    const encryptedstation = this._local.get('station');
    if (Object.keys(encryptedstation).length > 0) {
      const decryptedstation = this.decryptData(encryptedstation);
      return decryptedstation;
    }
    // else {
    //   this.router.navigate(['/login']);
    // }
  }
  encryptLogin(data: any): string {
    const key = data?.token;
    const secretKey = key;
    const encryptedData = btoa(JSON.stringify(data) + secretKey);
    return encryptedData;
  }
}
