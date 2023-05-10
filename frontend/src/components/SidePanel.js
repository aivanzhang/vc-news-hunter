import { Box, Button, Divider, Text, VStack } from "@chakra-ui/react";
import { Fragment } from "react";
import classNames from "classnames";
import sources from "../data.json";

const SidePanel = ({ newsSource, setNewsSource }) => {
  const handleButtonClick = (value) => {
    setNewsSource(value);
  };

  return (
    <VStack spacing={2} w="full">
      {sources.map((source) =>
        source.children ? (
          <Fragment key={source.id}>
            <VStack spacing={2} w="full">
              <Button
                variant={newsSource === source.id ? "solid" : "ghost"}
                colorScheme={newsSource === source.id ? "primary" : "gray"}
                onClick={() => handleButtonClick(source.id)}
                justifyContent="flex-start"
                className="w-full"
              >
                <Box mr={2} className="relative flex h-3 w-3">
                  <span
                    className={classNames(
                      newsSource === source.id && "animate-ping",
                      "absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"
                    )}
                  ></span>
                  <span className="relative inline-flex rounded-full h-full w-full bg-green-500"></span>
                </Box>
                <Text overflow="hidden">{source.title}</Text>
              </Button>
              <VStack spacing={2} w="full" pl="10">
                {Object.keys(source.children).map((child) => (
                  <Button
                    key={child}
                    variant={newsSource === child ? "solid" : "ghost"}
                    colorScheme={newsSource === child ? "primary" : "gray"}
                    onClick={() => handleButtonClick(child)}
                    justifyContent="flex-start"
                    className="w-full"
                  >
                    <Box mr={2} className="relative flex h-3 w-3">
                      <span
                        className={classNames(
                          newsSource === child && "animate-ping",
                          "absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"
                        )}
                      ></span>
                      <span className="relative inline-flex rounded-full h-full w-full bg-green-500"></span>
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
              variant={newsSource === source.id ? "solid" : "ghost"}
              colorScheme={newsSource === source.id ? "primary" : "gray"}
              onClick={() => handleButtonClick(source.id)}
              justifyContent="flex-start"
              className="w-full"
            >
              <Box mr={2} className="relative flex h-3 w-3">
                <span
                  className={classNames(
                    newsSource === source.id && "animate-ping",
                    "absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"
                  )}
                ></span>
                <span className="relative inline-flex rounded-full h-full w-full bg-green-500"></span>
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
