import { DeliveryNoteDetails } from "./DeliveryNoteDetails";

export interface DeliveryNote{
    customerDeliveryNoteNo: any;
    customerDeliveryNoteDeliveryId?:number;
    customerDeliveryNoteDeliveryDate?:Date;
    customerDeliveryNoteCpoId?:number;
    customerDeliveryNoteCpoDate?:Date;
    customerDeliveryNoteLocationId?:number;
    customerDeliveryNoteCustomerCode?:number;
    customerDeliveryNoteCustomerName?:string;
    customerDeliveryNoteSalesManId?:number;
    customerDeliveryNoteCurrencyId?:number;
    customerDeliveryNoteDeliveryAddress?:string;
    customerDeliveryNoteRemarks?:string;
    customerDeliveryNoteFsno?:number;
    customerDeliveryNoteUserId?:number;
    customerDeliveryNoteNote?:string;
    customerDeliveryNoteWarranty?:string;
    customerDeliveryNoteTraining?:string;
    customerDeliveryNoteTechnicalDetails?:string;
    customerDeliveryNoteTerms?:string;
    customerDeliveryNotePacking?:string;
    customerDeliveryNoteQuality?:string;
    customerDeliveryNoteIssuedStatus?:Boolean;
    customerDeliveryNoteAttention?:string;
    customerDeliveryNotePodId?:number;
    customerDeliveryNoteDelDetId?:number;
    customerDeliveryNoteManuelPo?:number;
    customerDeliveryNoteDeliveryStatus?:string;
    customerDeliveryNoteDelStatus?:Boolean;
    customerDeliveryNoteJobID?:number;
    customerDeliveryNoteDetails : DeliveryNoteDetails [];
    customerDeliveryNoteVehicleNo?: string;
    customerDeliveryNoteDriver?:string;
}