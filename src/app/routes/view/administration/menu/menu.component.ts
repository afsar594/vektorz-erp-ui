import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MegaMenuItem, MenuItem, TreeNode } from 'primeng';
import { SidebarModule } from 'primeng/sidebar';
import { AdministrationService } from 'src/app/routes/service/Administrations/administration.service';
import { LoginService } from 'src/app/routes/service/login.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  MenuFormGroup:FormGroup
  displaySidebar = false;
  files: TreeNode[];
  title: string = 'Menu';
  index: number = 0;
  subtitle: string;
  fb: any;
  workGroupId:any;
  handleChange(e) {
    this.index = e.index;
  }
  selectedFile: TreeNode;
  constructor(
    private activatedroute: ActivatedRoute,
    private AdministrationService:AdministrationService,
    private loginser: LoginService,
  )
  {
    this.MenuFormGroup = new FormGroup({
      title: new FormControl('',),
      controller: new FormControl(''),
      RoutUrl: new FormControl(''),
      Order: new FormControl(''),
      ParentId: new FormControl(''),
      Action: new FormControl(''),
      Icon: new FormControl(''),
      Page: new FormControl(''),
  })
}

  ngOnInit(): void {
    this.activatedroute.data.subscribe(data => {
      this.title = data.title;
      this.subtitle = data.subtitle;
      this.workGroupId = this.loginser.GetCredentialData().workGroupId;
      //console.log("workGroupId",this.workGroupId)
    });
    // this.files =
    //   [
    //     {
    //       "label": "Dashboard",
    //       "data": "Documents Folder",
    //       "expandedIcon": "pi pi-folder-open",
    //       "collapsedIcon": "pi pi-folder",

    //     },
    //     {
    //       "label": "Master",
    //       "data": "Pictures Folder",
    //       "expandedIcon": "pi pi-folder-open",
    //       "collapsedIcon": "pi pi-folder",
    //       "children": [
    //         { "label": "List  Master", "icon": "pi pi-image", "data": "Barcelona Photo" },
    //         { "label": "Price Master", "icon": "pi pi-file", "data": "PrimeFaces Logo" },
    //         { "label": "Asset Master", "icon": "pi pi-image", "data": "PrimeUI Logo" }]
    //     },
    //     {
    //       "label": "Account",
    //       "data": "Movies Folder",
    //       "expandedIcon": "pi pi-folder-open",
    //       "collapsedIcon": "pi pi-folder",
    //       "children": [{
    //         "label": "Payment Voucher",
    //         "data": "Pacino Movies",
    //         "children": [{ "label": "Scarface", "icon": "pi pi-video", "data": "Scarface Movie" }, { "label": "Serpico", "icon": "pi pi-file-video", "data": "Serpico Movie" }]
    //       },
    //       {
    //         "label": "Receipt Voucher",
    //         "data": "De Niro Movies",
    //         "children": [{ "label": "Goodfellas", "icon": "pi pi-video", "data": "Goodfellas Movie" }, { "label": "Untouchables", "icon": "pi pi-video", "data": "Untouchables Movie" }]
    //       }]
    //     },
    //     {
    //       "label": "Store And Werehouse ",
    //       "data": "Movies Folder",
    //       "expandedIcon": "pi pi-folder-open",
    //       "collapsedIcon": "pi pi-folder",
    //       "children": [
    //         {
    //         "label": "GRN",
    //         "data": "Pacino Movies",
    //         "children": [
    //           { "label": "Scarface", "icon": "pi pi-video", "data": "Scarface Movie" }
    //           , { "label": "Serpico", "icon": "pi pi-file-video", "data": "Serpico Movie" }
    //         ]
    //       },
    //       {
    //         "label": "Stock Ledger Reort",
    //         "data": "De Niro Movies",
    //         "children": [{ "label": "Goodfellas", "icon": "pi pi-video", "data": "Goodfellas Movie" }, { "label": "Untouchables", "icon": "pi pi-video", "data": "Untouchables Movie" }]
    //       }]
    //     },
    //     {
    //       "label": "Sales",
    //       "data": "Movies Folder",
    //       "expandedIcon": "pi pi-folder-open",
    //       "collapsedIcon": "pi pi-folder",
    //       "children": [{
    //         "label": "Sales Voucher ",
    //         "data": "Pacino Movies",
    //         "children": [{ "label": "Scarface", "icon": "pi pi-video", "data": "Scarface Movie" }, { "label": "Serpico", "icon": "pi pi-file-video", "data": "Serpico Movie" }]
    //       },
    //       {
    //         "label": "Sales Return",
    //         "data": "De Niro Movies",
    //         "children": [{ "label": "Goodfellas", "icon": "pi pi-video", "data": "Goodfellas Movie" }, { "label": "Untouchables", "icon": "pi pi-video", "data": "Untouchables Movie" }]
    //       }]
    //     },
    //     {
    //       "label": "Procurement",
    //       "data": "Movies Folder",
    //       "expandedIcon": "pi pi-folder-open",
    //       "collapsedIcon": "pi pi-folder",
    //       "children": [{
    //         "label": "Purchase Voucher",
    //         "data": "Pacino Movies",
    //         "children": [{ "label": "Scarface", "icon": "pi pi-video", "data": "Scarface Movie" }, { "label": "Serpico", "icon": "pi pi-file-video", "data": "Serpico Movie" }]
    //       },
    //       {
    //         "label": "Purchase Order",
    //         "data": "De Niro Movies",
    //         "children": [{ "label": "Goodfellas", "icon": "pi pi-video", "data": "Goodfellas Movie" }, { "label": "Untouchables", "icon": "pi pi-video", "data": "Untouchables Movie" }]
    //       }]
    //     },
    //     {
    //       "label": "Mis Report",
    //       "data": "Movies Folder",
    //       "expandedIcon": "pi pi-folder-open",
    //       "collapsedIcon": "pi pi-folder",
    //       "children": [{
    //         "label": "Trial Balance",
    //         "data": "Pacino Movies",
    //         "children": [{ "label": "Scarface", "icon": "pi pi-video", "data": "Scarface Movie" }, { "label": "Serpico", "icon": "pi pi-file-video", "data": "Serpico Movie" }]
    //       },
    //       {
    //         "label": "Balance Sheet",
    //         "data": "De Niro Movies",
    //         "children": [{ "label": "Goodfellas", "icon": "pi pi-video", "data": "Goodfellas Movie" }, { "label": "Untouchables", "icon": "pi pi-video", "data": "Untouchables Movie" }]
    //       }]
    //     },
    //     {
    //       "label": "Administration",
    //       "data": "Movies Folder",
    //       "expandedIcon": "pi pi-folder-open",
    //       "collapsedIcon": "pi pi-folder",
    //       "children": [{
    //         "label": "Programm Setting",
    //         "data": "Pacino Movies",
    //         "children": [{ "label": "Scarface", "icon": "pi pi-video", "data": "Scarface Movie" }, { "label": "Serpico", "icon": "pi pi-file-video", "data": "Serpico Movie" }]
    //       },
    //       {
    //         "label": "General Setting",
    //         "data": "De Niro Movies",
    //         "children": [{ "label": "Goodfellas", "icon": "pi pi-video", "data": "Goodfellas Movie" }, { "label": "Untouchables", "icon": "pi pi-video", "data": "Untouchables Movie" }]
    //       }]
    //     },
    //     {
    //       "label": "Transaction",
    //       "data": "Movies Folder",
    //       "expandedIcon": "pi pi-folder-open",
    //       "collapsedIcon": "pi pi-folder",
    //       "children": [{
    //         "label": "Leave Detail",
    //         "data": "Pacino Movies",
    //         "children": [{ "label": "Scarface", "icon": "pi pi-video", "data": "Scarface Movie" }, { "label": "Serpico", "icon": "pi pi-file-video", "data": "Serpico Movie" }]
    //       },
    //       ]
    //     }
    //   ]
    this.GetMenusByWorkgroup(this.workGroupId)
  }
  GetMenusByWorkgroup(id){
    this.AdministrationService.GetMenusByWorkgroupId(id).subscribe((response)=>{
        const result = response.result;
        this.files = this.mapMenuItems(result);
         //console.log('menuItems', this.files);
    })
}

GetSavedMenuById(id){
  this.AdministrationService.getSavedMenuById(id).subscribe((res)=>{
      this.updateValue(res.result)

  })
}
Save(){

  let menu = {
    Id: 1, // Assuming Id is hardcoded for illustration
    Title: this.MenuFormGroup.get('title')?.value,
    IsDeleted: false,
    ParentId: this.MenuFormGroup.get('ParentId')?.value,
    CreatedAt: new Date(),
    Controller: this.MenuFormGroup.get('controller')?.value,
    Action: this.MenuFormGroup.get('Action')?.value,
    RouteUrl: this.MenuFormGroup.get('RoutUrl')?.value,
    IconClass: this.MenuFormGroup.get('Icon')?.value,
    Order: this.MenuFormGroup.get('Order')?.value,
    Page: this.MenuFormGroup.get('Page')?.value,
    MenusWorkgroupDetails: []
};

  //  this.AdministrationService.SavedMenu(menu).subscribe((res)=>{
  //   console.log("result of save")
  //  })
}
Update(){
    // this.AdministrationService.UpdateMenu(this.MenuFormGroup.value).subscribe((res)=>{
    //    console.log("result of Update",res)
    //   })
}
mapMenuItems(result: any[]): any[] {
  const files = [];
  for (const item of result) {
      const fileItem: any = {
          children: [],
          label: item.label,
          data: 'Movies Folder',
          expanded: false,
          expandedIcon: "pi pi-folder-open",
          collapsedIcon: "pi pi-folder"
      };

      if (item.items && item.items.length > 0) {
          const children = [];
          for (const childItem of item.items) {

              const fileItems: any = {
                  children: childItem.items || [],
                  label: childItem.label,
                  data: "Pacino Movies",
              };
              children.push(fileItems);
          }
          fileItem.children = children;
      }
      files.push(fileItem);
  }
  return files;
}


items: any[] = [
  {
    label: 'New Item', icon: 'pi pi-plus', group: 'G', command: (event) => {
     // this.router.navigate(['/master/item/entry/' + this.selectedFile.data.itemMasterItemId]);
    },
    disabled: false
  }
  ,
  {
    label: 'Edit Item', icon: 'pi pi-user-edit', group: 'I', command: (event) => {
     // this.router.navigate(['/master/item/edit/' + this.selectedFile.data.itemMasterItemId]);
    },
    disabled: false
  },
  {
    label: 'Delete Item', icon: 'pi pi-trash', group: 'I', command: (event) => {
      // event doesn't contain anything useful,
      // and only has the clicked menu item specific information.
     // this.delete();
    },
    disabled: false
  }
];

onNodeSelect(event: any) {

}

getItemData(event: any) {
  if(event.node.id!=null){
   this.GetSavedMenuById(event.node.id)
  }
}
contextMenuSelection($event, cm) {

}
loadNode(event) {
}


updateValue(data: any) {
  this.MenuFormGroup.patchValue({
    title: data.title,
    controller: data.controller,
    RoutUrl: data.routeUrl,
    Order: data.order,
    ParentId: data.parentId,
    Action: data.action,
    Icon: data.iconClass,
    Page: data.page
  });
}
}
