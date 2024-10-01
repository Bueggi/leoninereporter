"use client";
import { Droppable } from "react-beautiful-dnd";

const Column = ({ title, tasks, id }) => {
  return (
    <>
      <div>{title}</div>
      <Droppable droppableId={id}>
        {(provided, snapshot) => {
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            isDraggingOver={snapshot.isDraggingOver}
          >
            {provided.placeholder}
          </div>
        }}
      </Droppable>
    </>
  );
};

export default Column;
