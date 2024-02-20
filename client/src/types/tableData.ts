export type Section = {
    importance?: number;
    heading?: string;
    data: (string | number)[][];
};

type AllowedStyles =
    | "bold"
    | "italics"
    | "underline"
    | "color"
    | "percentage"
    | "iconsFront"
    | "iconsEnd"
    | "stripNegativeSign"
    | "alignLeft"
    | "alignRight";

export interface ITableData {
    headings?: string[];
    sections?: {
        [key: string]: Section;
    };
    settings?: {
        collapsable?: boolean;
        sortable?: boolean;
        multiSelect?: boolean;
        multiSelectSection?: boolean;
        lazyLoad?: boolean;
        lockSectionHeadingOnScroll?: boolean;
        sortBySection?: boolean;
        filterBySection?: boolean;
        styleColumnsByValue?: number[][];
        columnStyling?: AllowedStyles[][];
    };
}
