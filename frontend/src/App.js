import { ChakraProvider } from "@chakra-ui/react";

function App() {
  return (
    <ChakraProvider>
      <div className="bg-blue-500 hover:bg-blue-600">Hello, world!</div>
    </ChakraProvider>
  );
}

export default App;
