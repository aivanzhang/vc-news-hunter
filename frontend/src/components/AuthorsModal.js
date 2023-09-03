import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Button,
  Input,
  IconButton,
} from "@chakra-ui/react";
import { IoMdAdd as AddIcon, IoMdTrash as DeleteIcon } from "react-icons/io";

function AuthorsModal({ isOpen, setIsOpen, names, setNames }) {
  const [newName, setNewName] = useState("");

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(names);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setNames(items);
  };

  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Drag and Drop Names</ModalHeader>
        <ModalBody>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="names">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {names.map((name, index) => (
                    <Draggable key={name} draggableId={name} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="flex items-center justify-between p-2 my-2 rounded-lg shadow-md bg-gray-200"
                        >
                          {name}
                          <IconButton
                            icon={<DeleteIcon />}
                            onClick={() =>
                              setNames((prev) => prev.filter((n) => n !== name))
                            }
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          <div className="flex items-center mt-4">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Add new name"
            />
            <IconButton
              ml={2}
              icon={<AddIcon />}
              onClick={() => {
                if (newName) {
                  setNames((prev) => [...prev, newName]);
                  setNewName("");
                }
              }}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => setIsOpen(false)}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default AuthorsModal;
