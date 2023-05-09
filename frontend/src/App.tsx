import { ChakraProvider } from "@chakra-ui/react";

function App() {
  return (
    <ChakraProvider>
      <div className="bg-gray-100 p-4">
        <div className="bg-blue-500 hover:bg-blue-600 text-lg">
          Hello, world!
        </div>
      </div>
    </ChakraProvider>
  );
}

export default App;
