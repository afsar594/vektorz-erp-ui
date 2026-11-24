import { Component, OnInit } from '@angular/core';
import { ItemMaster } from 'src/app/routes/domain';
import { MasterApiService } from 'src/app/routes/service/master.api.services';

@Component({
  selector: 'app-item-serach',
  templateUrl: './item-serach.component.html',
  styleUrls: ['./item-serach.component.scss']
})
export class ItemSerachComponent implements OnInit {
  cols: any[];
  ItemMasterArray: ItemMaster[] = [];
  constructor(
    private masterapi: MasterApiService,
  ) { }

  ngOnInit(): void {
    this.cols = [
      { field: 'itemMasterItemId', header: 'MatID' },
      { field: 'itemMasterPartNo', header: 'PartNo' },
      { field: 'itemMasterItemName', header: 'Materials' },
      { field: 'itemMasterVenderName', header: 'Vender' },
      { field: '', header: 'BarCode' },
      { field: 'itemMasterRef1', header: 'Referance' },
      { field: 'itemMasterCurrentStock', header: 'Stock' },
      { field: '', header: 'Unit Price' },
      { field: '', header: 'Last Pur Price' },
      { field: '', header: 'Last Sales Price' },
      { field: '', header: 'LC' },
    ];
    this.getAllItemMaster();
  }


  getAllItemMaster_OLD() {
    this.masterapi.GetAllItemNotGroup().subscribe(k => {
      this.ItemMasterArray = k.result;
      console.log("list", this.ItemMasterArray)
    });
  }

  getAllItemMaster() {
    
    this.masterapi.GetAllItemNotGroupForItemMaster().subscribe((response: any) => {
      const result = response.result;

      this.ItemMasterArray = result
      //this.items = this.mapMenuItems(result);
    });


  }

  
}
