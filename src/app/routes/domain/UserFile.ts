
export interface UserFile {
    userId?: number;
    logInId?: string;
    userName?: string;
    workGroupId?: number;
    password?: string;
    deleted?: boolean;
    system?: boolean;
    freeze?: boolean;
    location?: string;
    financialperiod?: string;
    financialPeriodsFsno?: number;
    locId?: number;
    token?: string;
    refreshToken?: string;
}
