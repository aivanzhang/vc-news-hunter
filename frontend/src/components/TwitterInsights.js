import { Button } from "@chakra-ui/react";
import { IoLogoTwitter } from "react-icons/io";
import TweetModal from "./TwitterModal";
import { useState } from "react";

export default function TwitterInsights({ tweetsArray, tweets_summary }) {
  const [isOpen, setIsOpen] = useState(false);
  const [tweets, setTweets] = useState(null);
  const [tweetsSummary, setTweetsSummary] = useState(null);
  return (
    <>
      <TweetModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        onClose={() => setIsOpen(false)}
        tweets={tweets}
        tweets_summary={tweetsSummary}
      />
      <Button
        p="2"
        leftIcon={<IoLogoTwitter />}
        colorScheme="blue"
        size="twitter"
        variant="solid"
        onClick={(e) => {
          e.stopPropagation();
          setTweetsSummary(tweets_summary);
          setTweets(tweetsArray);
          setIsOpen(true);
        }}
      >
        Stats
      </Button>
    </>
  );
}
