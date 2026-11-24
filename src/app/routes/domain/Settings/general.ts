export interface GeneralSettings {
    generalSettingsId: number;
    generalSettingsKeyValue: string;
    generalSettingsCategory: string;
    generalSettingsDescription: string;
    generalSettingsValueType: string;
    generalSettingsBoolValue?: boolean;
    generalSettingsNumValue?: number;
    generalSettingsTextValue: any;
    generalSettingsTableName: string;
    generalSettingsDelStatus?: any;
    options: Array<any>
}