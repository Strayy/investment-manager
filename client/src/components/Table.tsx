import { useEffect, useState } from "react";
import { ITableData, Section } from "../types/tableData";

import SkeletonLoading from "./SkeletonLoading";

function Table({ data, isLoading }: { data: ITableData | null; isLoading?: boolean }): JSX.Element {
    const [columnSortOrder, setColumnSortOrder] = useState<boolean | null>(null);
    const [columnSortIndex, setColumnSortIndex] = useState<number | null>(null);

    const [headingElements, setHeadingElements] = useState<JSX.Element[] | undefined>();
    const [dataElements, setDataElements] = useState<JSX.Element[][][] | undefined>();

    // Set default column sort based on settings in ITableData
    useEffect(() => {
        if (data?.settings?.defaultSortOrder !== undefined) {
            setColumnSortOrder(data.settings.defaultSortOrder === "asc" ? true : false);
        }

        if (data?.settings?.defaultSortIndex !== undefined) {
            setColumnSortIndex(data.settings.defaultSortIndex);
        }
    }, [data]);

    // Update data cells ordering if data or sorting is changed
    useEffect(() => {
        setHeadingElements(returnHeadings());
        setDataElements(returnSections());
    }, [data, columnSortIndex, columnSortOrder]);

    // Style table cell based on styleColumnsByValue and columnStyling data
    function styleCell(dataContent: string | number, columnIndex: number) {
        // Returns the corresponding array index in styleColumnsByValue for cell index. I.e., first column (cell index 0) in [[1], [2], [0]] equals 2. Returns -1 if it doesn't exist.
        const arrayIndex = data?.settings?.styleColumnsByValue?.findIndex(
            (array: number[]) => array.indexOf(columnIndex) !== -1,
        );

        // Returns dataContent for cell if cell is not to be styled, otherwise, styles the cell before returning.
        if (arrayIndex === undefined || arrayIndex === -1) {
            return dataContent;
        } else {
            const columnStyling = data?.settings?.columnStyling;
            let dataValueForStyling;
            let returnData = dataContent;

            // Strip negative sign from corresponding cell data. E.g: -10 -> 10
            if (columnStyling?.[arrayIndex].includes("stripNegativeSign")) {
                returnData = String(returnData).replace("-", "");
            }

            // Add percentage sign to corresponding cell data. E.g: 50 -> 50%
            if (columnStyling?.[arrayIndex].includes("percentage")) {
                returnData = returnData + "%";
            }

            // If cell is to be styled with colour or icons on front or back, convert to number value for conditional styling. E.g: -10% -> -10
            if (
                columnStyling?.[arrayIndex].some(
                    (style) => style === "color" || style === "iconsFront" || style === "iconsEnd",
                ) ||
                false
            ) {
                dataValueForStyling = Number(String(dataContent).replace(/[^-.0-9]/g, ""));
            }

            // Returns icon for corresponding dataValueForStyling entry. If value is negative, returns trend-down. Positive returns trend-up and 0 returns horizontal line.
            const generateIcon = (dataValue: number): JSX.Element | undefined => {
                if (dataValue === 0) {
                    return <i className='fi fi-ss-horizontal-rule'></i>;
                } else if (dataValue < 0) {
                    return <i className='fi fi-ss-arrow-trend-down'></i>;
                } else if (dataValue > 0) {
                    return <i className='fi fi-ss-arrow-trend-up'></i>;
                }
            };

            // Applies simple conditional styling to <p> tag to be returned.
            const dataReturn = (
                <p
                    className={`${
                        columnStyling?.[arrayIndex].includes("bold") ? "bold-data" : ""
                    } ${columnStyling?.[arrayIndex].includes("italics") ? "italics-data" : ""} ${
                        columnStyling?.[arrayIndex].includes("underline") ? "underline-data" : ""
                    } ${
                        columnStyling?.[arrayIndex].includes("color") &&
                        dataValueForStyling !== undefined
                            ? dataValueForStyling > 0
                                ? "color-data style-positive"
                                : dataValueForStyling < 0
                                  ? "color-data style-negative"
                                  : "color-data style-neutral"
                            : ""
                    }
                    
                    ${
                        columnStyling?.[arrayIndex].includes("styleBuySell") &&
                        dataContent !== undefined &&
                        typeof dataContent === "string" &&
                        ["buy", "sell"].includes(dataContent.toLowerCase())
                            ? dataContent.toLowerCase() === "buy"
                                ? "color-data style-positive"
                                : "color-data style-negative"
                            : ""
                    }
                    ${columnStyling?.[arrayIndex].includes("alignLeft") ? "align-left-data" : ""} ${
                        columnStyling?.[arrayIndex].includes("alignRight") ? "align-right-data" : ""
                    }`}
                >
                    {columnStyling?.[arrayIndex].includes("iconsFront") &&
                        dataValueForStyling !== undefined &&
                        generateIcon(dataValueForStyling)}

                    {returnData}

                    {columnStyling?.[arrayIndex].includes("iconsEnd") &&
                        dataValueForStyling !== undefined &&
                        generateIcon(dataValueForStyling)}
                </p>
            );

            return dataReturn;
        }
    }

    // Generates table headings
    function returnHeadings() {
        const thElements: JSX.Element[] = [];

        data?.headings?.forEach((heading: string, index: number) => {
            thElements.push(
                <th key={`heading-${index}`}>
                    <div
                        onClick={() => {
                            setColumnSortOrder(
                                index !== columnSortIndex ? false : !columnSortOrder,
                            );
                            setColumnSortIndex(index);
                        }}
                    >
                        <p>{heading}</p>
                        {columnSortIndex !== null &&
                            columnSortIndex === index &&
                            !columnSortOrder && <i className='fi fi-rr-caret-down'></i>}
                        {columnSortIndex !== null &&
                            columnSortIndex === index &&
                            columnSortOrder && <i className='fi fi-rr-caret-up'></i>}
                    </div>
                </th>,
            );
        });

        return thElements;
    }

    // Generates table sections and columns
    function returnSections() {
        const sections: JSX.Element[][][] = [];

        if (data && data.sections) {
            // Loops through table data sections
            Object.entries(data.sections).forEach(
                (section: [string, Section], sectionIndex: number) => {
                    const sectionElement: JSX.Element[][] = [];

                    // Returns section heading row if specified in table data prop with heading and importance values.
                    sectionElement.push([
                        <tr
                            key={`section-${sectionIndex}-heading`}
                            className={`${
                                section[1].importance
                                    ? `importance-${section[1].importance} section-header`
                                    : "section-header"
                            } ${data.settings?.lockSectionHeadingOnScroll ? "section-header-sticky" : ""}`}
                        >
                            {section[1].heading && (
                                <td colSpan={section[1].data[0].length}>{section[1].heading}</td>
                            )}
                        </tr>,
                    ]);

                    const sortData: { [key: string | number]: (string | number)[][] } = {};

                    if (columnSortIndex !== null) {
                        section[1].data.forEach((sectionData: (string | number)[]) => {
                            if (!sortData[sectionData[columnSortIndex]]) {
                                sortData[sectionData[columnSortIndex]] = [];
                            }

                            sortData[sectionData[columnSortIndex]].push(sectionData);
                        });
                    }

                    const createDataRow = (sectionData: (string | number)[], rowIndex: number) => {
                        const sectionRow: JSX.Element[] = [];

                        sectionData.forEach((sectionDataItem: string | number, index: number) => {
                            // Conditionally checks if cell styling is specified in table data prop and attempts to style all cells if true. Otherwise, no point attempting to style so just pushes the data to array.
                            sectionRow.push(
                                <td key={`section-${sectionIndex}-row-${rowIndex}-column-${index}`}>
                                    {data?.settings?.styleColumnsByValue &&
                                    data?.settings.columnStyling
                                        ? styleCell(sectionDataItem, index)
                                        : sectionDataItem}
                                </td>,
                            );
                        });

                        sectionElement.push([
                            <tr key={`section-${sectionIndex}-row`}>{sectionRow}</tr>,
                        ]);
                    };

                    // Check to see if data should be sorted and create sortIndexes array containing sorted sortIndex keys if true. If false, loop through dataRows in section and create data row.
                    if (columnSortIndex !== null) {
                        const sortedIndexes = Object.keys(sortData)
                            .slice()
                            .sort((a: string, b: string) => {
                                // Sorts string items and throws error if value is anything other than a string
                                if (typeof a === "string" && typeof b === "string") {
                                    // If string contains more than 1 "/" character and represents a date
                                    if (a.split("/").length > 1 && b.split("/").length > 1) {
                                        const [dayA, monthA, yearA] = a.split("/").map(Number);
                                        const [dayB, monthB, yearB] = b.split("/").map(Number);

                                        return (
                                            new Date(yearA, monthA - 1, dayA).getTime() -
                                            new Date(yearB, monthB - 1, dayB).getTime()
                                        );
                                    }

                                    // If not in date format, attempt to compare as a number. If not a number, compare as a string.
                                    const numA = parseFloat(a);
                                    const numB = parseFloat(b);

                                    if (!isNaN(numA) && !isNaN(numB)) {
                                        return numA - numB;
                                    } else {
                                        return a.localeCompare(b);
                                    }
                                } else {
                                    throw new Error("Unsupported data types in the array");
                                }
                            });

                        // If columnSortOrder is set to "desc", reverse sortedIndexes
                        if (columnSortOrder === false) {
                            sortedIndexes.reverse();
                        }

                        // Loop through sorted indexes
                        sortedIndexes.forEach((sortedIndex: string | number) => {
                            sortData[sortedIndex].forEach((dataRow, rowIndex) => {
                                createDataRow(dataRow, rowIndex);
                            });
                        });
                    } else {
                        section[1].data.forEach((dataRow, rowIndex) => {
                            createDataRow(dataRow, rowIndex);
                        });
                    }

                    // Adds entire section (section heading + section data) to sections array.
                    sections.push(sectionElement);
                },
            );

            return sections;
        }
    }

    return (
        <div className='table-component'>
            <table>
                <thead>
                    {data !== null && (
                        <>{data.headings && <tr className='headings'>{headingElements}</tr>}</>
                    )}
                </thead>
                <tbody>
                    {data !== null && (
                        <>
                            {isLoading && data.settings?.lazyLoad === true ? (
                                <SkeletonLoading
                                    skeletonStyle='table-rows'
                                    tableColumns={data.headings.length}
                                    tableRows={4}
                                />
                            ) : (
                                dataElements
                            )}
                        </>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default Table;
