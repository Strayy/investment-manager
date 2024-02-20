// TODO - Fix TS imports to use ITableData/create new ISectionData interface
// FIXME - Incorporate keys into array elements
import ITableData from "../types/tableData";

function Table(data: any) {
    function returnHeadings() {
        let thElements: JSX.Element[] = [];

        data.data.headings.forEach((heading: string, index: number) => {
            thElements.push(<th key={`heading-${index}`}>{heading}</th>);
        });

        return thElements;
    }

    function returnSections() {
        let sections: JSX.Element[][][] = [];

        if (data.data.sections) {
            Object.entries(data.data.sections).forEach(
                (section: any, sectionIndex: number) => {
                    const sectionElement: JSX.Element[][] = [];

                    sectionElement.push([
                        <tr
                            key={`section-${sectionIndex}-heading`}
                            className={
                                section[1].importance &&
                                `importance-${section[1].importance}`
                            }
                        >
                            {section[1].heading && (
                                <td colSpan={section[1].data[0].length}>
                                    {section[1].heading}
                                </td>
                            )}
                        </tr>,
                    ]);

                    section[1].data.forEach(
                        (
                            sectionData: (string | number)[],
                            rowIndex: number
                        ) => {
                            const sectionRow: JSX.Element[] = [];

                            sectionData.forEach(
                                (
                                    sectionDataItem: string | number,
                                    index: number
                                ) => {
                                    const dataValueForStyling = Number(
                                        String(sectionDataItem).replace(
                                            /[^-.0-9]/g,
                                            ""
                                        )
                                    );

                                    sectionRow.push(
                                        <td
                                            key={`section-${sectionIndex}-row-${rowIndex}-column-${index}`}
                                            className={`${
                                                data.data.settings
                                                    .boldDataColumns &&
                                                data.data.settings.boldDataColumns.includes(
                                                    index
                                                )
                                                    ? "bold-data"
                                                    : ""
                                            }${
                                                data.data.settings
                                                    .styleColumnsByValue &&
                                                data.data.settings.styleColumnsByValue.includes(
                                                    index
                                                )
                                                    ? dataValueForStyling > 0
                                                        ? "data-styled test-true"
                                                        : dataValueForStyling <
                                                          0
                                                        ? "data-styled test-false"
                                                        : "data-styled test-neutral"
                                                    : ""
                                            }`}
                                        >
                                            <p>{sectionDataItem}</p>
                                        </td>
                                    );
                                }
                            );

                            sectionElement.push([
                                <tr key={`section-${sectionIndex}-row`}>
                                    {sectionRow}
                                </tr>,
                            ]);
                        }
                    );

                    sections.push(sectionElement);
                }
            );

            return sections;
        }
    }

    return (
        <div className="table">
            <table className="returns-table">
                <tbody>
                    {data.data !== null && (
                        <>
                            <tr className="headings">{returnHeadings()}</tr>
                            {returnSections()}
                        </>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default Table;
