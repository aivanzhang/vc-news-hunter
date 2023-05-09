import { Box, Flex, Text } from "@chakra-ui/react";
import Layout from "../components/Layout";

const cardData = [
  {
    id: 1,
    title: "Card 1",
    description: "This is the description for card 1",
  },
  {
    id: 2,
    title: "Card 2",
    description: "This is the description for card 2",
  },
  {
    id: 3,
    title: "Card 3",
    description: "This is the description for card 3",
  },
];

const Dashboard = () => {
  return (
    <Layout>
      <Box p={4}>
        {cardData.map((card) => (
          <Flex
            key={card.id}
            borderWidth="1px"
            borderRadius="lg"
            p={4}
            mb={4}
            alignItems="center"
          >
            <Box mr={4} className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-full w-full bg-green-500"></span>
            </Box>
            <Box>
              <Text fontWeight="bold">{card.title}</Text>
              <Text>{card.description}</Text>
            </Box>
          </Flex>
        ))}
      </Box>
    </Layout>
  );
};

export default Dashboard;
