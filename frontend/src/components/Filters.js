import {
  Checkbox,
  CheckboxGroup,
  Divider,
  HStack,
  Input,
  // Select,
  Text,
  VStack,
  Wrap,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Button,
} from "@chakra-ui/react";
import { forwardRef, useState } from "react";
import DatePicker from "react-datepicker";
import AuthorsModal from "./AuthorsModal";

const newsTypes = ["All", "Startup"];
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
  dateRange,
  setDateRange,
  types,
  onChangeTypes = () => {},
  onSliderChangeEnd = () => {},
  names,
  setNames,
}) => {
  const [businessSliderValue, setBusinessSliderValue] = useState(25);
  const [sciTechSliderValue, setSciTechSliderValue] = useState(50);
  const [rankByAuthors, toggleRankByAuthors] = useState(false);
  const [showSliders, toggleSliders] = useState(false);

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
      <AuthorsModal
        isOpen={rankByAuthors}
        setIsOpen={toggleRankByAuthors}
        names={names}
        setNames={setNames}
      />
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
      {/* <Text fontWeight="bold">Sort By</Text>
      <Select value={selectedOption} onChange={handleSelectSort}>
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select> */}
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
      {types.has("Startup") && (
        <HStack spacing={3}>
          <Text fontWeight="bold" w="full">
            Startup Tuning
          </Text>
          <Button
            onClick={() => toggleSliders((prev) => !prev)}
            variant="outline"
            colorScheme="primary"
          >
            {showSliders ? "Hide" : "Show"}
          </Button>
        </HStack>
      )}
      {types.has("Startup") && showSliders && (
        <VStack w="full">
          <Text w="full">Business: {businessSliderValue / 100}</Text>
          <Slider
            defaultValue={25}
            min={0}
            max={100}
            onChange={(val) => setBusinessSliderValue(val)}
            onChangeEnd={(val) => onSliderChangeEnd("Business", val)}
          >
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
      <Button
        onClick={() => toggleRankByAuthors((prev) => !prev)}
        variant={names.length > 0 ? "solid" : "outline"}
        colorScheme="primary"
      >
        Filter By Authors ({names.length})
      </Button>
      <Divider borderColor="black" />
    </VStack>
  );
};

export default Filters;
