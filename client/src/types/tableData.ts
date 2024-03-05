export type Section = {
    importance?: number;
    heading?: string;
    data: (string | number)[][];
};

type AllowedStyles =
    | "bold" // SUPPORTED
    | "italics" // SUPPORTED
    | "underline" // SUPPORTED
    | "color" // SUPPORTED
    | "percentage" // SUPPORTED
    | "iconsFront" // SUPPORTED
    | "iconsEnd" // SUPPORTED
    | "stripNegativeSign" // SUPPORTED
    | "alignLeft" // SUPPORTED FOR NON COLOR-STYLED VALUES - COLOR-STYLED VALUES DEFAULT TO CENTRE ALIGNMENT
    | "alignRight"; // SUPPORTED FOR NON COLOR-STYLED VALUES - COLOR-STYLED VALUES DEFAULT TO CENTRE ALIGNMENT

export interface ITableData {
    headings?: string[];
    sections?: {
        [key: string]: Section;
    };
    settings?: {
        collapsable?: boolean; // NOT SUPPORTED
        sortable?: boolean; // NOT SUPPORTED - ENABLED BY DEFAULT
        multiSelect?: boolean; // NOT SUPPORTED
        multiSelectSection?: boolean; // NOT SUPPORTED
        lazyLoad?: boolean; // SUPPORTED
        lockSectionHeadingOnScroll?: boolean; // SUPPORTED
        sortBySection?: boolean; // NOT SUPPORTED - INTEGRATE WITH SECTION HEADINGS. ADD CHECK TO SEE IF SECTION HEADING EXISTS FIRST
        filterBySection?: boolean; // NOT SUPPORTED
        styleColumnsByValue?: number[][]; // SUPPORTED
        columnStyling?: AllowedStyles[][]; // SUPPORTED
        defaultSortOrder?: "asc" | "desc"; // SUPPORTED
        defaultSortIndex?: number; // SUPPORTED
    };
}
