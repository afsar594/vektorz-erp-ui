import { ItemMaster } from './ItemMaster';
import { UnitMaster } from './UnitMaster';
export interface UnitDetails { 
    unitDetailsId?: number;
    unitDetailsItemId?: number;
    unitDetailsUnitId?: number;
    unitDetailsConversionType?: number;
    unitDetailsRate?: number;
    unitDetailsWrate?: number;
    unitDetailsDefUnit?: boolean;
    unitDetailsDefWunit?: boolean;
    unitDetailsPacking?: string;
    unitDetailsBarcode?: string;
    unitDetailsDescrption?: string;
    unitDetailsUnitCost?: number;
    unitDetailsUnitPrice?: number;
    unitDetailsProfitPer?: number;
    unitDetailsOverhdPer?: number;
    unitDetailsHeight?: number;
    unitDetailsWidth?: number;
    unitDetailsReorder?: number;
    unitDetailsDelStatus?: boolean;
    unitDetailsItem?: ItemMaster;
    unitDetailsUnit?: UnitMaster;
    }

