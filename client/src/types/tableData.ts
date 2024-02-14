interface ITableData {
    headings?: string[];
    sections?: {
        [key: string]: {
            importance?: number;
            heading?: string;
            data: (string | number | null)[][];
            // FIXME - Remove null type declaration once data processing completed in Portfolio.tsx
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
    };
}

export default ITableData;
