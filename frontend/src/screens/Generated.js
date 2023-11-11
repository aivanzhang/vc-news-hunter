import {
  Badge,
  Button,
  HStack,
  Heading,
  IconButton,
  Spacer,
  Text,
  VStack,
  Spinner,
  Card,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import { IoIosCopy } from "react-icons/io";
import Layout from "../components/Layout";
import { toast } from "react-toastify";
import sources from "../sources.json";
import TwitterInsights from "../components/TwitterInsights";
import { useParams } from "react-router-dom";
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

function Generated() {
  const { generated_id } = useParams();
  const [showOriginal, toggleShowOriginal] = useState(false);
  const [articles, setArticles] = useState();
  const [generatedPost, setGeneratedPost] = useState();

  useEffect(() => {
    const get_generated_articles = async () => {
      try {
        const response = await axios.post("/getGeneratedNewsletter", {
          generated_id,
        });
        const data = response.data;

        setGeneratedPost(data.generated);
        setArticles(data.articles);
      } catch (error) {
        console.error("Error fetching statuses:", error);
      }
    };
    get_generated_articles();
  }, [generated_id]);

  if (!generatedPost || !articles) {
    return <Spinner size="xl" />;
  }

  console.log(generatedPost);

  return (
    <Layout>
      <HStack
        spacing={4}
        display="flex"
        flexDir="inline-flex"
        className="h-full w-full"
      >
        <VStack spacing={4} p={2} w="full" h="full" overflowY="scroll">
          <VStack w="full" spacing={5} alignItems="flex-start">
            <Heading fontWeight="bold" fontSize="xl">
              Generated on {new Date(generatedPost.date).toLocaleString()}
            </Heading>
            <Button
              colorScheme="primary"
              onClick={() => toggleShowOriginal((prev) => !prev)}
            >
              Show Original Articles
            </Button>
          </VStack>
          {showOriginal && (
            <VStack border="1px" p="5" rounded="md" borderColor="gray.300">
              {articles.map((item, index) => (
                <VStack
                  key={index}
                  borderRadius="md"
                  shadow="md"
                  p={4}
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
                    {item.tweets && (
                      <TwitterInsights
                        tweetsArray={item.tweets}
                        tweets_summary={item.tweets_summary}
                      />
                    )}
                    <IconButton
                      icon={<IoIosCopy />}
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(item.title);
                        toast("Copied title to clipboard!", {
                          position: "top-right",
                          autoClose: 5000,
                          hideProgressBar: false,
                          closeOnClick: true,
                          progress: undefined,
                          theme: "light",
                        });
                      }}
                    />
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
                        variant={
                          category === item["type"] ? "solid" : "outline"
                        }
                      >
                        {category}: {item[category].toFixed(2)}
                      </Badge>
                    ))}
                  </HStack>
                </VStack>
              ))}
            </VStack>
          )}
          <Card w="full" h="full" p="5">
            <Markdown
              components={ChakraUIRenderer()}
              children={generatedPost.generated}
              skipHtml
            />
          </Card>
        </VStack>
      </HStack>
    </Layout>
  );
}

export default Generated;
