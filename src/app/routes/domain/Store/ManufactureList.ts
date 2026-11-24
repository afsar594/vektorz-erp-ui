import{manufactureListDetails} from"./manufactureListDetails"

export interface manufactureList{   
 
  mI_Id_N: number,
  mI_VocherNo: string,
  mI_RF_V: string,
  mI_Item_ID: number,
  mI_Remarks_V: string,
  manufactureItemsMasterStatus: boolean,
  manufactureItemsMasterDeleted: boolean,
  manufactureItemsMasterDetails:manufactureListDetails[];

}