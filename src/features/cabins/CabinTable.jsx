import Spinner from "../../ui/Spinner";
import CabinRow from "./CabinRow";
import { useCabins } from "./useCabins";
import Table from "../../ui/Table";
import Menus from "../../ui/Menus";
import { useSearchParams } from "react-router-dom";
import Empty from "../../ui/Empty";
import ExcelJS from "exceljs";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

function CabinTable() {
	const { isLoading, cabins } = useCabins();
	const [searchParams] = useSearchParams();

	if (isLoading) return <Spinner />;
	if (!cabins.length) return <Empty resourceName="cabins" />;

	// 1. FILTER
	const filterValue = searchParams.get("discount") || "all";

	let filteredCabins;
	if (filterValue === "all") filteredCabins = cabins;
	if (filterValue === "no-discount")
		filteredCabins = cabins.filter((cabin) => cabin.discount === 0);
	if (filterValue === "with-discount")
		filteredCabins = cabins.filter((cabin) => cabin.discount > 0);

	// 2. SORT
	const sortBy = searchParams.get("sortBy") || "name-asc";
	const [field, direction] = sortBy.split("-");
	const modifier = direction === "asc" ? 1 : -1;
	const sortedCabins = filteredCabins.sort(
		(a, b) => (a[field] - b[field]) * modifier
	);
	console.log("This is the field", field);
	console.log("This is the direction", direction);

	console.log("This is the cabins from cabintable.jsx", sortedCabins);

	const columns = [
		{ id: "cabin", width: 17, header: "Cabin" },
		{
			id: "maxCapacity",
			width: 18,
			header: "Maximum Capacity",
		},
		{
			id: "regularPrice",
			width: 20,
			header: "Price",
		},
		{
			id: "discount",
			width: 20,
			header: "Discount",
		},
	];

	const exportData = [];
	sortedCabins.map((item) => {
		let p = {};
		columns.map((head) => {
			if (head.id === "cabin") {
				p[head.id] = item["name"];
			} else {
				p[head.id] = item[head.id];
			}
		});
		exportData.push(p);
	});

	console.log("This is the export data", exportData);

	const handleExportExcel = () => {
		const createExcelFile = async () => {
			const imageSrc = "./logo-light.png";
			const response = await fetch(imageSrc);
			const buffer1 = await response.arrayBuffer();
			const workbook = new ExcelJS.Workbook();
			let worksheet = workbook.addWorksheet("Bookings");
			worksheet.addRow({});

			let rowM = ["A", "B", "C", "D"];
			worksheet.mergeCells(`A2: ${rowM[rowM.length - 1]}2`);

			let m1 = worksheet.getCell("A2");
			m1.value = `The Wild Oasis - Cabins Table`;
			(m1.font = {
				bold: true,
				size: 16,
			}),
				(m1.alignment = {
					vertical: "middle",
					horizontal: "center",
				});
			m1.fill = {
				type: "pattern",
				pattern: "solid",
				fgColor: {
					argb: "FFADD8E6",
				},
			};
			worksheet.getRow(worksheet.lastRow.number).height = 25;

			let headings = [
				`Filtered by : ${
					filterValue === "all"
						? "All"
						: filterValue === "no-discount"
						? "No Discount"
						: "With Disount"
				}`,
				`Sorted by : ${
					field === "name"
						? "Name"
						: field === "regularPrice"
						? "Price"
						: "Capacity"
				} ${direction === "desc" ? "Descending" : "Ascending"}`,
			];

			for (let i = 3; i <= headings.length + 3; i++) {
				rowM.map((item) => {
					let c1 = worksheet.getCell(`${item}${i}`);
					c1.fill = {
						type: "pattern",
						pattern: "solid",
						fgColor: {
							argb: "FFADD8E6",
						},
					};
					c1.font = {
						size: 12,
					};
				});
				worksheet.mergeCells(`A${i}:${rowM[rowM.length - 1]}${i}`);
			}
			worksheet.getCell("A3").value = headings[0];
			worksheet.getCell("A3").alignment = {
				vertical: "middle",
				horizontal: "center",
			};
			worksheet.getCell("A4").value = headings[1];
			worksheet.getCell("A4").alignment = {
				vertical: "middle",
				horizontal: "center",
			};

			worksheet.addRow({});
			let cd = columns.map((item) => item.header);
			worksheet.addRow(cd);

			rowM.map((item) => {
				let c1 = worksheet.getCell(`${item}${worksheet.lastRow.number}`);
				c1.fill = {
					type: "pattern",
					pattern: "solid",
					fgColor: {
						argb: "FFF0E68C",
					},
				};
				c1.alignment = {
					vertical: "middle",
					horizontal: "center",
					wrapText: true,
				};
				c1.font = {
					bold: true,
				};
				c1.border = {
					top: {
						style: "medium",
						color: {
							argb: "FF000000",
						},
					},
					left: {
						style: "medium",
						color: {
							argb: "FF000000",
						},
					},
					bottom: {
						style: "medium",
						color: {
							argb: "FF000000",
						},
					},
					right: {
						style: "medium",
						color: {
							argb: "FF000000",
						},
					},
				};
			});
			worksheet.getRow(worksheet.lastRow.number).height = 60;

			worksheet.columns = columns.map((item) => {
				return {
					key: item.id,
					width: item.width,
				};
			});

			exportData.map((item) => {
				worksheet.addRow(item);
				rowM.map((item) => {
					let c1 = worksheet.getCell(`${item}${worksheet.lastRow.number}`);

					c1.border = {
						top: {
							style: "medium",
							color: {
								argb: "FF000000",
							},
						},
						left: {
							style: "medium",
							color: {
								argb: "FF000000",
							},
						},
						bottom: {
							style: "medium",
							color: {
								argb: "FF000000",
							},
						},
						right: {
							style: "medium",
							color: {
								argb: "FF000000",
							},
						},
					};
				});
			});
			const imageId = workbook.addImage({
				buffer: buffer1,
				extension: "png",
			});

			worksheet.addImage(imageId, {
				tl: {
					col: 0,
					row: 1,
				},
				ext: {
					width: 130,
					height: 90,
				},
			});

			const buffer = await workbook.xlsx.writeBuffer();

			const blob = new Blob([buffer], {
				type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			});

			const url = URL.createObjectURL(blob);

			const link = document.createElement("a");
			link.href = url;
			link.setAttribute("download", `The Wild Oasis - Cabins Table.xlsx`);
			document.body.appendChild(link);
			link.click();

			document.body.removeChild(link);
			URL.revokeObjectURL(url);
		};
		createExcelFile();
	};

	const handleExportPDF = async () => {
		const doc = new jsPDF({ orientation: "landscape" });
		let headings = [
			[`The Wild Oasis - Cabins Table`],
			[
				`Filtered by : ${
					filterValue === "all"
						? "All"
						: filterValue === "no-discount"
						? "No Discount"
						: "With Disount"
				}`,
			],
			[
				`Sorted by : ${
					field === "name"
						? "Name"
						: field === "regularPrice"
						? "Price"
						: "Capacity"
				} ${direction === "desc" ? "Descending" : "Ascending"}`,
			],
		];
		const tableData = [];
		const tableHeaders = columns.map((c) => c.header);
		exportData.map((data) => {
			let p = [];
			columns.map((column) => {
				p.push(data[column.id]);
			});
			tableData.push(p);
		});
		let linesCoord = [];
		let linesCoord2 = [];
		let fx = 0;
		let fy = 0;

		autoTable(doc, {
			head: [],
			body: headings,
			bodyStyles: {
				fontStyle: "bold",
				halign: "center",
				textColor: [0, 0, 0],
				fontSize: 12,
			},
			willDrawCell: function (data) {
				if (data.row.index >= 0) {
					linesCoord.push([
						data.cell.x,
						data.cell.y,
						data.cell.x,
						data.cell.y + data.cell.height,
					]);
					// right side border
					linesCoord.push([
						data.cell.x + data.cell.width,
						data.cell.y,
						data.cell.x + data.cell.width,
						data.cell.y + data.cell.height,
					]);
					// bottom line for each cell
					linesCoord2.push([
						data.cell.x,
						data.cell.y + data.cell.height,
						data.cell.x + data.cell.width,
						data.cell.y + data.cell.height,
					]);

					doc.setFillColor(173, 216, 230);
				}
				// top border for table
				if (data.row.index === 0) {
					linesCoord.push([
						data.cell.x,
						data.cell.y,
						data.cell.x + data.cell.width,
						data.cell.y,
					]);
				}
				// to find the position of the last cell of the table
				if (data.row.index === headings.length - 1) {
					fx = data.cell.x;
					fy = data.cell.y + data.cell.height;
					linesCoord.push([
						data.cell.x,
						data.cell.y + data.cell.height,
						data.cell.x + data.cell.width,
						data.cell.y + data.cell.height,
					]);
				}
			},
		});

		linesCoord.map((item) => {
			doc.setLineWidth(0.5);
			doc.setDrawColor(0, 0, 0);
			doc.line(item[0], item[1], item[2], item[3]);
		});
		linesCoord2.map((item) => {
			doc.setLineWidth(0.2);
			doc.setDrawColor(0, 0, 0);
			doc.line(item[0], item[1], item[2], item[3]);
		});

		autoTable(doc, {
			columns,
			head: [tableHeaders],
			body: tableData,
			theme: "grid",
			startY: fy + 10,
			headStyles: {
				fillColor: [240, 230, 140],
				textColor: [0, 0, 0],
				lineWidth: 0.5,
				lineColor: [0, 0, 0],
			},
			bodyStyles: {
				textColor: [0, 0, 0],
				lineWidth: 0.2,
				lineColor: [0, 0, 0],
			},
		});

		doc.save("The Wild Oasis - Cabins Table.pdf");
	};

	return (
		<Menus>
			<Table columns="0.6fr 1.8fr 2.2fr 1fr 1fr 1fr">
				<Table.Header>
					<div></div>
					<div>Cabin</div>
					<div>Capacity</div>
					<div>Price</div>
					<div>Discount</div>
					<div>
						<Menus.Menu>
							<Menus.Toggle />
							<Menus.List>
								<Menus.Button onClick={() => handleExportPDF()}>
									Export to PDF
								</Menus.Button>
								<Menus.Button onClick={() => handleExportExcel()}>
									Export to Excel
								</Menus.Button>
							</Menus.List>
						</Menus.Menu>
					</div>
				</Table.Header>

				<Table.Body
					// data={filteredCabins}
					data={sortedCabins}
					render={(cabin) => <CabinRow cabin={cabin} key={cabin.id} />}
				/>
			</Table>
		</Menus>
	);
}

export default CabinTable;
