interface ITableData {
    headings?: string[];
    sections?: {
        [key: string]: {
            importance?: number;
            heading?: string;
            data: (string | number)[][];
        };
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
        boldDataColumns?: number[];
        styleColumnsByValue?: number[];
    };
}

export default ITableData;
