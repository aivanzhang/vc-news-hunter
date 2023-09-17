import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Box,
  Text,
  HStack,
  VStack,
} from "@chakra-ui/react";
import { Tweet } from "react-tweet";

function TweetModal({ isOpen, onClose, tweets, tweets_summary }) {
  if (!tweets || !tweets_summary) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Tweets</ModalHeader>
        <ModalCloseButton />
        <ModalBody maxH="2xl" overflow="scroll">
          <Box my={4} p={4} bg="gray.100" borderRadius="md">
            <Text fontWeight="bold" mb={2}>
              Totals
            </Text>
            <HStack spacing={10}>
              <VStack spacing={1}>
                <Text fontSize="sm" w="full">
                  Views: {tweets_summary.views}
                </Text>
                <Text fontSize="sm" w="full">
                  Likes: {tweets_summary.favorite_count}
                </Text>
                <Text fontSize="sm" w="full">
                  Followers: {tweets_summary.total_followers_count}
                </Text>
                <Text fontSize="sm" w="full">
                  Following: {tweets_summary.total_friends_count}
                </Text>
              </VStack>
              <VStack spacing={1}>
                <Text fontSize="sm" w="full">
                  Replies: {tweets_summary.reply_count}
                </Text>
                <Text fontSize="sm" w="full">
                  Retweets: {tweets_summary.retweet_count}
                </Text>
                <Text fontSize="sm" w="full">
                  Bookmarks: {tweets_summary.bookmark_count}
                </Text>
                <Text fontSize="sm" w="full">
                  Quotes: {tweets_summary.quote_count}
                </Text>
              </VStack>
            </HStack>
          </Box>
          {tweets.map((tweet, index) => (
            <Box
              key={index}
              mb={4}
              p={4}
              border="1px"
              borderColor="gray.200"
              borderRadius="md"
            >
              <Tweet id={tweet.url.split("/").pop()} />
              <HStack spacing={4}>
                <VStack spacing={1} w="full">
                  <Text fontSize="sm" color="gray.500" w="full">
                    Views: {tweet.views}
                  </Text>
                  <Text fontSize="sm" color="gray.500" w="full">
                    Likes: {tweet.favorite_count}
                  </Text>
                  <Text fontSize="sm" color="gray.500" w="full">
                    Followers: {tweet.author.followers_count}
                  </Text>
                  <Text fontSize="sm" color="gray.500" w="full">
                    Following: {tweet.author.friends_count}
                  </Text>
                </VStack>
                <VStack spacing={1} w="full">
                  <Text fontSize="sm" color="gray.500" w="full">
                    Replies: {tweet.reply_count}
                  </Text>
                  <Text fontSize="sm" color="gray.500" w="full">
                    Retweets: {tweet.retweet_count}
                  </Text>
                  <Text fontSize="sm" color="gray.500" w="full">
                    Bookmarks: {tweet.bookmark_count}
                  </Text>
                  <Text fontSize="sm" color="gray.500" w="full">
                    Quotes: {tweet.quote_count}
                  </Text>
                </VStack>
              </HStack>
            </Box>
          ))}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default TweetModal;
