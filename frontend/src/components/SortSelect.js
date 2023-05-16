import { Select } from "@chakra-ui/react";
import { useState } from "react";

const defaultOptions = [
  { value: "filter", label: "Filter" },
  { value: "chronological_asc", label: "Chronological (Asc)" },
  { value: "chronological_desc", label: "Chronological (Desc)" },
  { value: "alphabetical_asc", label: "Alphabetical (Asc)" },
  { value: "alphabetical_desc", label: "Alphabetical (Desc)" },
];
const SortSelect = ({ options = defaultOptions, onChange = () => {} }) => {
  const [selectedOption, setSelectedOption] = useState("");

  const handleOptionChange = (event) => {
    const option = event.target.value;
    setSelectedOption(option);
    onChange(option);
  };

  return (
    <Select
      placeholder="Sort By"
      position="sticky"
      top={0}
      zIndex="sticky"
      background="white"
      value={selectedOption}
      onChange={handleOptionChange}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
  );
};

export default SortSelect;
