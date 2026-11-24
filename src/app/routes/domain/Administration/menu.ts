export interface MenuLevel2 {
    label?: string;
    icon?: string;
    privilages?: number[];
    routerLink?: string[];
}

export interface MenuLevel1 {
    label?: string;
    icon?: string;
    privilages?: number[];
    routerLink?: string[];
    items?: MenuLevel2[];
}

export interface Menu {
    label?: string;
    icon?: string;
    privilages?: number[];
    routerLink?: string[];
    items?: MenuLevel1[];
}
// export interface MegaMenu {
//     label?: string;
//     icon?: string;
//      privilages?: number[];
//     // routerLink?: string[];
//     items?: any[];
// }