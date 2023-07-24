import {
  Checkbox,
  CheckboxGroup,
  Divider,
  HStack,
  Input,
  Select,
  Text,
  VStack,
  Wrap,
} from "@chakra-ui/react";
import { forwardRef, useState } from "react";
import DatePicker from "react-datepicker";

const defaultSortOptions = [{ value: "most_recent", label: "Most Recent" }];
const newsTypes = ["World", "Sports", "Business", "Sci/Tech", "Startup"];
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
  dateRange,
  setDateRange,
  types,
  onChangeTypes = () => {},
}) => {
  const [selectedOption, setSelectedOption] = useState("");

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
          selected={dateRange[0]}
          onChange={(date) => setDateRange((prevRange) => [date, prevRange[1]])}
          customInput={<DatePickerInput />}
        />
        <Text>-</Text>
        <DatePicker
          selected={dateRange[1]}
          onChange={(date) => setDateRange((prevRange) => [prevRange[0], date])}
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
      <Text fontWeight="bold">Type of News</Text>
      <CheckboxGroup colorScheme="green" value={Array.from(types)}>
        <Wrap spacing={3}>
          {newsTypes.map((type) => (
            <Checkbox
              key={type}
              value={type}
              colorScheme="primary"
              onChange={() => onChangeTypes(type)}
            >
              {type}
            </Checkbox>
          ))}
        </Wrap>
      </CheckboxGroup>
      <Divider borderColor="black" />
    </VStack>
  );
};

export default Filters;
