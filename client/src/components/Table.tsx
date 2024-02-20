import { ITableData, Section } from "../types/tableData";

import SkeletonLoading from "./SkeletonLoading";

function Table({
    data,
    isLoading,
}: {
    data: ITableData | null;
    isLoading?: boolean;
}): JSX.Element {
    // Style table cell based on styleColumnsByValue and columnStyling data
    function styleCell(dataContent: string | number, columnIndex: number) {
        // Returns the corresponding array index in styleColumnsByValue for cell index. I.e., first column (cell index 0) in [[1], [2], [0]] equals 2. Returns -1 if it doesn't exist.
        const arrayIndex = data?.settings?.styleColumnsByValue?.findIndex(
            (array: number[]) => array.indexOf(columnIndex) !== -1
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
                    (style) =>
                        style === "color" ||
                        style === "iconsFront" ||
                        style === "iconsEnd"
                ) ||
                false
            ) {
                dataValueForStyling = Number(
                    String(dataContent).replace(/[^-.0-9]/g, "")
                );
            }

            // Returns icon for corresponding dataValueForStyling entry. If value is negative, returns trend-down. Positive returns trend-up and 0 returns horizontal line.
            const generateIcon = (
                dataValue: number
            ): JSX.Element | undefined => {
                if (dataValue === 0) {
                    return <i className="fi fi-ss-horizontal-rule"></i>;
                } else if (dataValue < 0) {
                    return <i className="fi fi-ss-arrow-trend-down"></i>;
                } else if (dataValue > 0) {
                    return <i className="fi fi-ss-arrow-trend-up"></i>;
                }
            };

            // Applies simple conditional styling to <p> tag to be returned.
            let dataReturn = (
                <p
                    className={`${
                        columnStyling?.[arrayIndex].includes("bold")
                            ? "bold-data"
                            : ""
                    } ${
                        columnStyling?.[arrayIndex].includes("italics")
                            ? "italics-data"
                            : ""
                    } ${
                        columnStyling?.[arrayIndex].includes("underline")
                            ? "underline-data"
                            : ""
                    } ${
                        columnStyling?.[arrayIndex].includes("color") &&
                        dataValueForStyling !== undefined
                            ? dataValueForStyling > 0
                                ? "color-data style-positive"
                                : dataValueForStyling < 0
                                ? "color-data style-negative"
                                : "color-data style-neutral"
                            : ""
                    } ${
                        columnStyling?.[arrayIndex].includes("alignLeft")
                            ? "align-left-data"
                            : ""
                    } ${
                        columnStyling?.[arrayIndex].includes("alignRight")
                            ? "align-right-data"
                            : ""
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
        let thElements: JSX.Element[] = [];

        data?.headings?.forEach((heading: string, index: number) => {
            thElements.push(<th key={`heading-${index}`}>{heading}</th>);
        });

        return thElements;
    }

    // Generates table sections and columns
    function returnSections() {
        let sections: JSX.Element[][][] = [];

        if (data && data.sections) {
            // Loops through table data sections
            Object.entries(data.sections).forEach(
                (section: [string, Section], sectionIndex: number) => {
                    const sectionElement: JSX.Element[][] = [];

                    // Returns section heading row if specified in table data prop with heading and importance values.
                    sectionElement.push([
                        <tr
                            key={`section-${sectionIndex}-heading`}
                            className={
                                section[1].importance
                                    ? `importance-${section[1].importance}`
                                    : ""
                            }
                        >
                            {section[1].heading && (
                                <td colSpan={section[1].data[0].length}>
                                    {section[1].heading}
                                </td>
                            )}
                        </tr>,
                    ]);

                    // Loops through rows in the section
                    section[1].data.forEach(
                        (
                            sectionData: (string | number)[],
                            rowIndex: number
                        ) => {
                            const sectionRow: JSX.Element[] = [];

                            // Loops through the data to be inputted into the section row
                            sectionData.forEach(
                                (
                                    sectionDataItem: string | number,
                                    index: number
                                ) => {
                                    // Conditionally checks if cell styling is specified in table data prop and attempts to style all cells if true. Otherwise, no point attempting to style so just pushes the data to array.
                                    sectionRow.push(
                                        <td
                                            key={`section-${sectionIndex}-row-${rowIndex}-column-${index}`}
                                        >
                                            {data?.settings
                                                ?.styleColumnsByValue &&
                                            data?.settings.columnStyling
                                                ? styleCell(
                                                      sectionDataItem,
                                                      index
                                                  )
                                                : sectionDataItem}
                                        </td>
                                    );
                                }
                            );

                            // Adds section row to the section array.
                            sectionElement.push([
                                <tr key={`section-${sectionIndex}-row`}>
                                    {sectionRow}
                                </tr>,
                            ]);
                        }
                    );

                    // Adds entire section (section heading + section data) to sections array.
                    sections.push(sectionElement);
                }
            );

            return sections;
        }
    }

    return (
        <div className="table-component">
            <table>
                <tbody>
                    {data !== null && (
                        <>
                            {data.headings && (
                                <tr className="headings">{returnHeadings()}</tr>
                            )}
                            {isLoading ? (
                                <SkeletonLoading
                                    skeletonStyle="table-rows"
                                    tableColumns={8}
                                    tableRows={4}
                                />
                            ) : (
                                returnSections()
                            )}
                        </>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default Table;
