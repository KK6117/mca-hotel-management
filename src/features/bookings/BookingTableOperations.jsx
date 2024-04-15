import SortBy from "../../ui/SortBy";
import Filter from "../../ui/Filter";
import TableOperations from "../../ui/TableOperations";
import { HiPlus } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import Button from "../../ui/Button";

function BookingTableOperations() {
	const navigate = useNavigate();
	return (
		<TableOperations>
			<Filter
				filterField="status"
				options={[
					{ value: "all", label: "All" },
					{ value: "checked-out", label: "Checked out" },
					{ value: "checked-in", label: "Checked in" },
					{ value: "unconfirmed", label: "Unconfirmed" },
				]}
			/>

			<SortBy
				options={[
					{ value: "startDate-desc", label: "Sort by date (recent first)" },
					{ value: "startDate-asc", label: "Sort by date (earlier first)" },
					{
						value: "totalPrice-desc",
						label: "Sort by amount (high first)",
					},
					{ value: "totalPrice-asc", label: "Sort by amount (low first)" },
				]}
			/>

			<Button onClick={() => navigate("/newbooking")}>Add new booking</Button>
		</TableOperations>
	);
}

export default BookingTableOperations;
