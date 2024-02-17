// TODO - Fix TS imports to use ITableData/create new ISectionData interface
// FIXME - Incorporate keys into array elements
import ITableData from "../types/tableData";

function Table(data: any) {
    function returnHeadings() {
        let thElements: JSX.Element[] = [];

        data.data.headings.forEach((heading: string) => {
            thElements.push(<th>{heading}</th>);
        });

        return thElements;
    }

    function returnSections() {
        let sections: JSX.Element[][][] = [];

        if (data.data.sections) {
            Object.entries(data.data.sections).forEach((section: any) => {
                const sectionElement: JSX.Element[][] = [];

                sectionElement.push([
                    <tr
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

                section[1].data.forEach((sectionData: (string | number)[]) => {
                    const sectionRow: JSX.Element[] = [];

                    sectionData.forEach(
                        (sectionDataItem: string | number, index: number) => {
                            sectionRow.push(
                                <td
                                    className={
                                        data.data.settings.boldDataColumns &&
                                        data.data.settings.boldDataColumns.includes(
                                            index
                                        )
                                            ? "bold-data"
                                            : ""
                                    }
                                >
                                    {sectionDataItem}
                                </td>
                            );
                        }
                    );

                    sectionElement.push([<tr>{sectionRow}</tr>]);
                });

                sections.push(sectionElement);
            });

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
