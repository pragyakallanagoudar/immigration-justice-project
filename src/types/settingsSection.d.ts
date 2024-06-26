interface CommonSectionData {
  label: string;
  placeholder?: string;
  error?: string;
  editorLabel?: string;
  emptyText?: string;
}

export interface MiscSectionData extends CommonSectionData {
  type: 'text' | 'textarea' | 'date';
  value: string;
  format?: (v: string) => string;
  validate?: (v: string) => string;
}

export interface RadioSectionData extends CommonSectionData {
  type: 'radio';
  value: string;
  options: string[];
  format?: (v: string) => string;
  validate?: (v: string) => string;
}

interface SingleDropdownSectionData extends CommonSectionData {
  type: 'single-select';
  options: string[] | Map<string, string>;
  pageSize?: number;
  value: string | null;
  format?: (s: string | null) => string;
  validate?: (s: string | null) => string;
}

interface MultiDropdownSectionData extends CommonSectionData {
  type: 'multi-select';
  options: string[] | Map<string, string>;
  pageSize?: number;
  value: string[];
  format?: (s: string[]) => string;
  validate?: (s: string[]) => string;
}

export type SectionData =
  | SingleDropdownSectionData
  | MultiDropdownSectionData
  | MiscSectionData
  | RadioSectionData;

export type SettingsSectionData = Array<SectionData | SectionData[]>;

export interface SubSectionData {
  title: string;
  linkLabel: string;
  linkValue: string;
  data: SettingsSectionData;
}
