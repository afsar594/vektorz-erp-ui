export interface ProgramSettings {
    programSettingsGenId: number;
    programSettingsKeyValue: string;
    programSettingsCategory: string;
    programSettingsDescription: string;
    programSettingsValueType: string;
    programSettingsBoolValue?: boolean;
    programSettingsNumValue?: any;
    programSettingsTextValue: any;
    programSettingsTableName: string;
    programSettingsFormId: string;
    programSettingsDelStatus?: any;
    options: Array<any>
}