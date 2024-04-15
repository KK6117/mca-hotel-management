import styled from "styled-components";
import Form from "../../ui/Form";
import FormRow from "../../ui/FormRow";
import Input from "../../ui/Input";
import { useCabins } from "../cabins/useCabins";
import Spinner from "../../ui/Spinner";
import Checkbox from "../../ui/Checkbox";
import Button from "../../ui/Button";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { differenceInDays, isBefore, isDate, startOfToday } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useSettings } from "../settings/useSettings";
import toast from "react-hot-toast";
import { useGuests } from "../../hooks/useGuests";
import { useCreateBooking } from "./useCreateBooking";
import { useMoveBack } from "../../hooks/useMoveBack";
import Row from "../../ui/Row";
import Heading from "../../ui/Heading";
import ButtonText from "../../ui/ButtonText";
import { formatCurrency } from "../../utils/helpers";

const HeadingGroup = styled.div`
	display: flex;
	gap: 2.4rem;
	align-items: center;
`;

const Box = styled.div`
	/* Box */
	background-color: var(--color-grey-0);
	border: 1px solid var(--color-grey-100);
	border-radius: var(--border-radius-md);
	padding: 2.4rem 4rem;
`;

const StyledSelect = styled.select`
	border: 1px solid var(--color-grey-300);
	background-color: var(--color-grey-0);
	border-radius: var(--border-radius-sm);
	padding: 0.8rem 1.2rem;
	box-shadow: var(--shadow-sm);
`;

function NewBookingForm() {
	const [wantsBreakfast, setWantsBreakfast] = useState(false);
	const [isPaid, setIsPaid] = useState(false);
	const { cabins, isLoading } = useCabins();
	const { guests, isLoading: isLoadingGuests } = useGuests();
	const { settings, isLoading: isLoadingSettings } = useSettings();
	const { createBooking, isLoading: isCreating } = useCreateBooking();
	const navigate = useNavigate();
	const {
		register,
		handleSubmit,
		formState: { errors },
		getValues,
	} = useForm();

	const moveBack = useMoveBack();

	const [cabinId, setCabinId] = useState();

	useEffect(() => {
		if (cabins) {
			const firstCabinId = cabins;
			setCabinId(firstCabinId[0].id);
		}
	}, [cabins]);

	const [startDate, setStartDate] = useState();
	const [endDate, setEndDate] = useState();

	const [numGuests, setNumGuests] = useState(1);
	const [cabinPrice, setCabinPrice] = useState();
	const [breakfastPrice, setBreakfastPrice] = useState();

	useEffect(() => {
		let numNights;
		if (startDate && endDate) {
			numNights = differenceInDays(new Date(endDate), new Date(startDate));
		}
		if (cabinId && numNights && numGuests) {
			const selectedCabin = cabins.filter(
				(item) => item.id === Number(cabinId)
			);
			const selectedRegPrice = selectedCabin[0].regularPrice;
			const selectedDiscount = selectedCabin[0].discount;
			setCabinPrice((selectedRegPrice - selectedDiscount) * numNights);
			setBreakfastPrice(
				Number(settings.breakfastPrice) * numNights * numGuests
			);
		}
	}, [startDate, endDate, numGuests, cabinId, cabins, settings]);

	if (isLoading || isLoadingSettings || isLoadingGuests) return <Spinner />;

	function onSubmit(data) {
		const numNights = differenceInDays(
			new Date(data.endDate),
			new Date(data.startDate)
		);
		const today = startOfToday();
		//Filtering dates
		if (numNights < 1) {
			toast.error("Start date must be before end date");
			return;
		}
		if (numNights < settings.minBookingLength) {
			toast.error(
				`Minimum nights per booking are ${settings.minBookingLength}`
			);
			return;
		}
		if (numNights > settings.maxBookingLength) {
			toast.error(
				`Maximum nights per booking are ${settings.maxBookingLength}`
			);
			return;
		}
		if (isBefore(new Date(data.startDate), today)) {
			toast.error("You can't start a booking before today");
			return;
		}
		//cabinPrice
		const reservedCabin = cabins
			.filter((cabin) => cabin.id === Number(data.cabinId))
			.at(0);
		const cabinPrice =
			(reservedCabin.regularPrice - reservedCabin.discount) * numNights;

		//extrasPrice
		const extrasPrice = wantsBreakfast
			? settings.breakfastPrice * numNights * data.numGuests
			: 0;
		//totalPrice
		const totalPrice = cabinPrice + extrasPrice;
		const finalData = {
			...data,
			cabinPrice,
			extrasPrice,
			totalPrice,
			isPaid,
			numNights,
			cabinId: Number(data.cabinId),
			numGuests: Number(data.numGuests),
			guestId: Number(data.guestId),
			hasBreakfast: wantsBreakfast,
			status: "unconfirmed",
			startDate: new Date(data.startDate).toISOString(),
			endDate: new Date(data.endDate).toISOString(),
		};
		createBooking(finalData, {
			onSuccess: (data) => {
				navigate(`/bookings`);
			},
		});
	}
	return (
		<>
			<Row type="horizontal">
				<HeadingGroup>
					<Heading as="h1">New Booking</Heading>
				</HeadingGroup>
				<ButtonText onClick={moveBack}>&larr; Back</ButtonText>
			</Row>

			<Form onSubmit={handleSubmit(onSubmit)}>
				<FormRow label="Start date" error={errors?.startDate?.message}>
					<Input
						disabled={isCreating}
						type="date"
						id="startDate"
						onInput={(e) => {
							setStartDate(e.target.value);
						}}
						{...register("startDate", {
							required: "This field is required",
							validate:
								isDate(getValues().startDate) || "You must choose a valid date",
						})}
					/>
				</FormRow>
				<FormRow label="End date" error={errors?.endDate?.message}>
					<Input
						disabled={isCreating}
						type="date"
						id="endDate"
						onInput={(e) => {
							setEndDate(e.target.value);
						}}
						{...register("endDate", {
							required: "This field is required",
							validate:
								isDate(getValues().endDate) || "You must choose a valid date",
						})}
					/>
				</FormRow>
				<FormRow label="Number of guests" error={errors?.numGuests?.message}>
					<Input
						disabled={isCreating}
						type="number"
						min={1}
						defaultValue={1}
						id="numGuests"
						onInput={(e) => {
							setNumGuests(e.target.value);
						}}
						{...register("numGuests", {
							required: "This field is required",
							min: {
								value: 1,
								message: "Minimum number of guests must be 1",
							},
							max: {
								value: settings.maxGuestsPerBooking,
								message: `Max number of guests must be ${settings.maxGuestsPerBooking}`,
							},
						})}
					/>
				</FormRow>
				<FormRow label="Select cabin">
					<StyledSelect
						disabled={isCreating}
						id="cabinId"
						onInput={(e) => {
							setCabinId(e.target.value);
						}}
						{...register("cabinId")}
					>
						{cabins.map((cabin) => (
							<option key={cabin.id} value={cabin.id}>
								{cabin.name}
							</option>
						))}
					</StyledSelect>
				</FormRow>
				<FormRow label="Select guest">
					<StyledSelect
						disabled={isCreating}
						id="guestId"
						{...register("guestId")}
					>
						{guests.map((guest) => (
							<option key={guest.id} value={guest.id}>
								{guest.fullName}
							</option>
						))}
					</StyledSelect>
				</FormRow>
				<FormRow label="Further observations">
					<Input
						type="text"
						id="observations"
						disabled={isCreating}
						{...register("observations")}
					/>
				</FormRow>
				<Box>
					<Checkbox
						id="breakfast"
						onChange={() => setWantsBreakfast((e) => !e)}
						disabled={isCreating}
					>
						I want breakfast with my booking{" "}
						{breakfastPrice
							? `(Price: ${formatCurrency(breakfastPrice)})`
							: null}
					</Checkbox>
				</Box>

				<Box>
					<Checkbox
						id="paid"
						onChange={() => setIsPaid((e) => !e)}
						disabled={isCreating}
					>
						This booking is already paid for{" "}
						{cabinPrice
							? breakfastPrice && wantsBreakfast
								? `(Total: ${formatCurrency(
										cabinPrice + breakfastPrice
								  )} (${formatCurrency(cabinPrice)} + ${formatCurrency(
										breakfastPrice
								  )}))`
								: `(Total: ${formatCurrency(cabinPrice)})`
							: null}
					</Checkbox>
				</Box>
				<FormRow>
					<Button type="submit" variation="primary" disabled={isCreating}>
						Submit
					</Button>
					<Button type="cancel" variation="secondary" disabled={isCreating}>
						Cancel
					</Button>
					<Button
						variation="secondary"
						onClick={moveBack}
						disabled={isCreating}
					>
						Back
					</Button>
				</FormRow>
			</Form>
		</>
	);
}

export default NewBookingForm;
