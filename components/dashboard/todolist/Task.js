import { Draggable } from "react-beautiful-dnd";

const bgColorChange = (props) => {
  return props.isDragging
    ? "lightgreen"
    : props.isDraggable
    ? props.isBacklog
      ? "#F2D7D5"
      : "#DCDCDC"
    : props.isBacklog
    ? "#F2D7D5"
    : "#fffada";
};

const Task = ({ task, index }) => {
  return (
    <Draggable draggableId={`${task.id}`} key={task.id} index={index}>
      {(provided, snapshot) => {
        <>
          <div
            {...provided.dragHandleProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
            isDragging={snapshot.isDragging}
          ></div> 
          <div>{task.id}</div>
          <div>{task.title}</div>
          {provided.placeholder}
        </>;
      }}
    </Draggable>
  );
};

export default Task;
