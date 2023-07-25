import { Box, Button, Divider, Text, VStack } from "@chakra-ui/react";
import { Fragment, useEffect, useState } from "react";
import classNames from "classnames";
import sources from "../data.json";
import axios from "axios";

const SidePanel = ({ newsSources, setNewsSources }) => {
  const [statuses, setStatuses] = useState([]);

  const handleButtonClick = (value) => {
    setNewsSources((prevSet) => {
      const newSet = new Set(prevSet);
      if (newSet.has(value)) {
        newSet.delete(value);
      } else {
        newSet.add(value);
      }
      return newSet;
    });
  };

  useEffect(() => {
    // Define the function to fetch the statuses
    const fetchStatuses = async () => {
      try {
        const response = await axios.post(
          "https://09ac-54-224-28-130.ngrok-free.app/getStatuses",
          // "http://localhost:3000/getStatuses",
          {}
        );
        const data = response.data;
        setStatuses(data.statuses);
      } catch (error) {
        console.error("Error fetching statuses:", error);
      }
    };

    // Fetch statuses immediately when the component mounts
    fetchStatuses();

    // Set up the polling interval
    const interval = setInterval(() => {
      fetchStatuses();
    }, 60000); // 1 minute interval

    // Clean up the interval when the component unmounts
    return () => {
      clearInterval(interval);
    };
  }, []); // Empty dependency array to run the effect only once on mount

  return (
    <VStack spacing={2} w="full">
      {sources.map((source) =>
        source.children ? (
          <Fragment key={source.id}>
            <VStack spacing={2} w="full">
              <Button
                variant={newsSources.has(source.id) ? "solid" : "ghost"}
                colorScheme={newsSources.has(source.id) ? "primary" : "gray"}
                onClick={() => handleButtonClick(source.id)}
                justifyContent="flex-start"
                className="w-full"
              >
                <Box mr={2} className="relative flex h-3 w-3">
                  <span
                    className={classNames(
                      "absolute inline-flex h-full w-full rounded-full opacity-75",
                      statuses[source.id] ? "bg-green-400" : "bg-red-400"
                    )}
                  ></span>
                  <span
                    className={classNames(
                      "relative inline-flex rounded-full h-full w-full",
                      statuses[source.id] ? "bg-green-500" : "bg-red-500"
                    )}
                  ></span>
                </Box>
                <Text overflow="hidden">{source.title}</Text>
              </Button>
              <VStack spacing={2} w="full" pl="10">
                {Object.keys(source.children).map((child) => (
                  <Button
                    key={child}
                    variant={newsSources.has(child) ? "solid" : "ghost"}
                    colorScheme={newsSources.has(child) ? "primary" : "gray"}
                    onClick={() => handleButtonClick(child)}
                    justifyContent="flex-start"
                    className="w-full"
                  >
                    <Box mr={2} className="relative flex h-3 w-3">
                      <span
                        className={classNames(
                          "absolute inline-flex h-full w-full rounded-full opacity-75",
                          statuses[source.id] ? "bg-green-400" : "bg-red-400"
                        )}
                      ></span>
                      <span
                        className={classNames(
                          "relative inline-flex rounded-full h-full w-full",
                          statuses[source.id] ? "bg-green-500" : "bg-red-500"
                        )}
                      ></span>
                    </Box>
                    <Text overflow="hidden">
                      {source.children[child].title}
                    </Text>
                  </Button>
                ))}
              </VStack>
            </VStack>
            <Divider />
          </Fragment>
        ) : (
          <Fragment key={source.id}>
            <Button
              variant={newsSources.has(source.id) ? "solid" : "ghost"}
              colorScheme={newsSources.has(source.id) ? "primary" : "gray"}
              onClick={() => handleButtonClick(source.id)}
              justifyContent="flex-start"
              className="w-full"
            >
              <Box mr={2} className="relative flex h-3 w-3">
                <span
                  className={classNames(
                    "absolute inline-flex h-full w-full rounded-full opacity-75",
                    statuses[source.id] ? "bg-green-400" : "bg-red-400"
                  )}
                ></span>
                <span
                  className={classNames(
                    "relative inline-flex rounded-full h-full w-full",
                    statuses[source.id] ? "bg-green-500" : "bg-red-500"
                  )}
                ></span>
              </Box>
              <Text overflow="hidden">{source.title}</Text>
            </Button>
            <Divider />
          </Fragment>
        )
      )}
    </VStack>
  );
};

export default SidePanel;
