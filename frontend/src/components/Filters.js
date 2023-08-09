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
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
} from "@chakra-ui/react";
import { forwardRef, useState } from "react";
import DatePicker from "react-datepicker";

const defaultSortOptions = [{ value: "most_recent", label: "Most Recent" }];
const newsTypes = ["World", "Sports", "Business", "Sci/Tech", "Startup", "Misc"];
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
  onSelectSort = () => { },
  dateRange,
  setDateRange,
  types,
  onChangeTypes = () => { },
  onSliderChangeEnd = () => { },
}) => {
  const [selectedOption, setSelectedOption] = useState("");
  const [businessSliderValue, setBusinessSliderValue] = useState(50);
  const [sciTechSliderValue, setSciTechSliderValue] = useState(50);

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
      {types.has("Startup") && <Text fontWeight="bold" w="full">Startup Tuning</Text>}
      {types.has("Startup") && (
        <VStack w="full">
          <Text w="full">Business: {businessSliderValue / 100}</Text>
          <Slider
            defaultValue={50}
            min={0}
            max={100}
            onChange={(val) => setBusinessSliderValue(val)}
            onChangeEnd={(val) => onSliderChangeEnd("Business", val)} >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
          <Text w="full">Sci/Tech: {sciTechSliderValue / 100}</Text>
          <Slider
            defaultValue={50}
            min={0}
            max={100}
            onChange={(val) => setSciTechSliderValue(val)}
            onChangeEnd={(val) => onSliderChangeEnd("Sci/Tech", val)}
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
        </VStack>
      )}
      <Divider borderColor="black" />
    </VStack>
  );
};

export default Filters;
