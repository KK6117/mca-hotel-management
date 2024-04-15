import BookingRow from "./BookingRow";
import Table from "../../ui/Table";
import Menus from "../../ui/Menus";
import Empty from "../../ui/Empty";
import { useBookings } from "./useBookings";
import Spinner from "../../ui/Spinner";
import Pagination from "../../ui/Pagination";
import { useBookingsAll } from "./useBookingsAll";
import { useSearchParams } from "react-router-dom";
import ExcelJS from "exceljs";
import React from "react";
import { format } from "date-fns";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

function BookingTable() {
	const { bookings, isLoading, count } = useBookings();
	const { bookings: bookings2, isLoading: isLoading2 } = useBookingsAll();

	// Export required data
	const [searchParams] = useSearchParams();
	const filterValue = searchParams.get("status") || "all";
	const sortByRaw = searchParams.get("sortBy") || "startDate-desc";
	const [field, direction] = sortByRaw.split("-");

	// Define the columns required for export
	let columns = [
		{
			id: "cabinId",
			width: 10,
			header: "Cabin",
		},
		{
			id: "guest",
			width: 18,
			header: "Guest",
		},
		{
			id: "email",
			width: 25,
			header: "Email",
		},
		{
			id: "dates",
			width: 25,
			header: "Dates",
		},
		{
			id: "numGuests",
			width: 10,
			retrieveId: "numGuests",
			header: "No. of guests",
		},
		{
			id: "numNights",
			width: 10,
			retrieveId: "numNights",
			header: "No. of nights",
		},
		{
			id: "status",
			width: 12,
			retrieveId: "status",
			header: "Status",
		},
		{
			id: "amount",
			width: 10,
			retrieveId: "totalPrice",
			header: "Amount",
		},
	];

	const exportData = [];
	if (bookings2) {
		bookings2.map((item) => {
			let p = {};
			columns.map((head) => {
				if (head.id === "status") {
					p[head.id] =
						item.status === "unconfirmed"
							? "Unconfirmed"
							: item.status === "checked-in"
							? "Checked in"
							: "Checked out";
				} else if (head.id === "guest") {
					p[head.id] = item.guests.fullName;
				} else if (head.id === "email") {
					p[head.id] = item.guests.email;
				} else if (head.id === "cabinId") {
					p[head.id] = item.cabins.name;
				} else if (head.id === "dates") {
					p[head.id] = `${format(
						new Date(item.startDate),
						"MMM dd yyyy"
					)} - ${format(new Date(item.endDate), "MMM dd yyyy")}`;
				} else {
					p[head.id] = item[`${head.retrieveId}`];
				}
			});
			exportData.push(p);
		});
	}

	const handleExportExcel = () => {
		const createExcelFile = async () => {
			const imageSrc = "./logo-light.png";
			const response = await fetch(imageSrc);
			const buffer1 = await response.arrayBuffer();
			const workbook = new ExcelJS.Workbook();
			let worksheet = workbook.addWorksheet("Bookings");
			worksheet.addRow({});

			let rowM = ["A", "B", "C", "D", "E", "F", "G", "H"];
			worksheet.mergeCells(`A2: ${rowM[rowM.length - 1]}2`);

			let m1 = worksheet.getCell("A2");
			m1.value = `The Wild Oasis - Bookings Table`;
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
						: filterValue === "checked-out"
						? "Checked out"
						: filterValue === "checked-in"
						? "Checked in"
						: "Unconfirmed"
				}`,
				`Sorted by : ${
					field === "startDate" ? "Starting Date" : "Total price"
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
			link.setAttribute("download", `The Wild Oasis - Bookings Table.xlsx`);
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
			[`The Wild Oasis - Bookings Table`],
			[
				`Filtered by : ${
					filterValue === "all"
						? "All"
						: filterValue === "checked-out"
						? "Checked out"
						: filterValue === "checked-in"
						? "Checked in"
						: "Unconfirmed"
				}`,
			],
			[
				`Sorted by : ${
					field === "startDate" ? "Starting Date" : "Total price"
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

		doc.save("The Wild Oasis - Bookings Table.pdf");
	};

	if (isLoading) return <Spinner />;
	if (!bookings.length) return <Empty resourceName="bookings" />;

	return (
		<Menus>
			<Table columns="0.6fr 2fr 2.4fr 1.4fr 1fr 3.2rem">
				<Table.Header>
					<div>Cabin</div>
					<div>Guest</div>
					<div>Dates</div>
					<div>Status</div>
					<div>Amount</div>
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
					data={bookings}
					render={(booking) => (
						<BookingRow key={booking.id} booking={booking} />
					)}
				/>

				<Table.Footer>
					<Pagination count={count} />
				</Table.Footer>
			</Table>
		</Menus>
	);
}

export default BookingTable;
