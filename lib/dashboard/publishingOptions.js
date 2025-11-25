export const publishingOptions = [
  {
    title: "OFFER",
    description: "Dieses Angebot ist noch nicht abgeschlossen",
    color: "rgba(33, 145, 251, 0.2)",
  },
  {
    title: "INBOUND",
    description: "Dieses Angebot wurde über das Konaktformular eingefügt",
    color: "rgba(186, 39, 74, 0.2)",
  },
  {
    title: "SOLD",
    description: "Das Angebot wurde akzeptiert",
    current: true,
    color: "rgba(249, 203, 64, 0.2)",
  },
  {
    title: "RUNNING",
    description: "Die Kampagne wird aktuell ausgeliefert",
    current: true,
    color: "rgba(32, 191, 85, 0.2)",
  },
  {
    title: "COMPLETED",
    description: "Die Kampagne ist beendet und reported",
    current: true,
    color: "rgba(47, 72, 88, 0.2)",
  },
];

export const getColor = (status) => {
  const result = publishingOptions.filter((el) => el.title === status);
  return result.length ? result[0].color : "";
};
