import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  VStack,
  Spacer,
  HStack,
  Heading,
  Text,
  Badge,
  ModalFooter,
  Button,
  Box,
} from "@chakra-ui/react";
import sources from "../sources.json";
import axios from "axios";

const CATEGORIES = ["World", "Sports", "Business", "Sci/Tech", "Misc"];

function getSortedCategories(article) {
  const sortedCategories = Object.keys(article)
    .filter((key) => CATEGORIES.includes(key))
    .sort((a, b) => {
      return article[b] - article[a];
    });
  return sortedCategories;
}

function GenerateModal({ isOpen, onClose, articles }) {
  const [loading, setLoading] = useState(false);
  if (!articles) {
    return null;
  }
  const newsArticles = articles();

  const calculateAICost = () => {
    const countTokens =
      (newsArticles
        .map(
          ({ title, description, _id }) =>
            `Id: ${_id}\n\nTitle: ${title}\n\nDescription: ${description}`
        )
        .join("\n--------------------\n")
        .split(" ").length +
        150) /
      1000.0;

    return countTokens * 0.001 + countTokens * 5 * 0.002;
  };

  const generateNewsletter = async () => {
    try {
      setLoading(true);
      const response = await axios.post("/generateNewsletter", {
        articleIds: newsArticles.map((article) => article._id),
      });
      const data = response.data;
      window.open("/generated/" + data.generated_id, "_blank");
    } catch (error) {
      console.error("Error fetching statuses:", error);
    }
    setLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent maxW="50%">
        <ModalHeader>Selected Articles for Newletter</ModalHeader>
        <ModalCloseButton />
        <ModalBody maxH="md" overflow="scroll">
          {newsArticles.map((item, index) => (
            <VStack
              key={index}
              borderRadius="md"
              shadow="md"
              p={4}
              mb="4"
              spacing={1}
              w="full"
              alignItems="flex-start"
              cursor="pointer"
              onClick={() => window.open(item.link, "_blank")}
            >
              <HStack
                justifyContent="space-between"
                alignItems="center"
                w="full"
              >
                <VStack spacing={1} w="full" alignItems="flex-start">
                  <Text size="md" color="gray">
                    {sources[item.outlet]}
                  </Text>
                  <Heading as="h3" size="md">
                    {item.title}
                  </Heading>
                </VStack>
              </HStack>
              <Text>{item.description}</Text>
              <HStack alignItems="center" w="full">
                <Text fontSize="sm">
                  {item.authors.length > 0 && (
                    <>
                      <strong>{item.authors.join(", ")}</strong> •{" "}
                    </>
                  )}
                  {new Date(item.pub_date).toLocaleString()}
                </Text>
                <Spacer />
                {getSortedCategories(item).map((category, index) => (
                  <Badge
                    key={index}
                    colorScheme="primary"
                    rounded="md"
                    variant={category === item["type"] ? "solid" : "outline"}
                  >
                    {category}: {item[category].toFixed(2)}
                  </Badge>
                ))}
              </HStack>
            </VStack>
          ))}
        </ModalBody>
        <ModalFooter w="full" justifyContent="center" flexDir="column">
          <Button
            w="full"
            colorScheme="primary"
            onClick={generateNewsletter}
            isLoading={loading}
            loadingText="Generating"
          >
            Generate Newsletter
          </Button>
          <Box h="4" />
          <Text textAlign="center">
            <strong>
              Approximate AI cost: ${calculateAICost().toFixed(10)}
            </strong>
            <br />
            (Note that the actual cost may be higher)
          </Text>
          <Box h="4" />
          <Text textAlign="center">
            This will use the article's title and description to generate a Eric
            Newcomer style roundup. This might take a while.
          </Text>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default GenerateModal;
