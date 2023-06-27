import { Divider, HStack, Input, Select, Text, VStack } from "@chakra-ui/react";
import { forwardRef, useState } from "react";
import DatePicker from "react-datepicker";

const defaultSortOptions = [
  { value: "most_recent", label: "Most Recent" },
  { value: "most_relevant", label: "Most Relevant" },
];

const DatePickerInput = forwardRef(
  ({ value, onClick, className, ...props }, ref) => (
    <Input
      value={value}
      onClick={onClick}
      ref={ref}
      className="!p-2"
      {...props}
    />
  )
);

const Filters = ({
  sortOptions = defaultSortOptions,
  onSelectSort = () => {},
}) => {
  const [selectedOption, setSelectedOption] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const handleSelectSort = (event) => {
    const option = event.target.value;
    setSelectedOption(option);
    onSelectSort(option);
  };

  return (
    <VStack
      spacing={2}
      position="sticky"
      top={0}
      zIndex="sticky"
      background="white"
      w="full"
      alignItems="flex-start"
    >
      <Text fontWeight="bold">Date Range</Text>
      <HStack spacing={2} w="full" alignItems="center">
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          customInput={<DatePickerInput />}
        />
        <Text>-</Text>
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          customInput={<DatePickerInput />}
        />
      </HStack>
      <Text fontWeight="bold">Sort By</Text>
      <Select value={selectedOption} onChange={handleSelectSort}>
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
      <Divider borderColor="black" />
    </VStack>
  );
};

export default Filters;
