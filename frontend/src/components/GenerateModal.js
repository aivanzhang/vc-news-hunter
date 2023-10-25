import React from "react";
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
  if (!articles) {
    return null;
  }
  const newsArticles = articles();

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent maxW="50%">
        <ModalHeader>Selected Articles for Newletter</ModalHeader>
        <ModalCloseButton />
        <ModalBody maxH="lg" overflow="scroll">
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
          <Button w="full" disabled={true}>
            Generate Newsletter (coming soon)
          </Button>
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
