"use client";
import { DragDropContext } from "react-beautiful-dnd";
import Column from "./Column";
import { useState } from "react";

const KanBanBoard = () => {
  const [completed, setCompleted] = useState([]);
  const [incomplete, setIncomplete] = useState([]);
  console.log("hallo");
  return (
    <div>
      Hallo
      <DragDropContext>
        <h1>Progress Board</h1>
        <Column title={"TO DO"} tasks={incomplete} id={"1"}></Column>
      </DragDropContext>
    </div>
  );
};

export default KanBanBoard;
