import { View, Text } from "@react-pdf/renderer";
import { createTw } from "react-pdf-tailwind";

// Komponenten-Datei für die Tabellenzeile
const TableRow = ({ pair }) => {
  return (
    <View style={tw("flex flex-row border-t border-gray-300")}>
      {/* Erstes Attribut-Wert-Paar */}
      <Text style={tw("w-1/4 px-4 py-2 text-sm text-left")}>
        {pair[0].label}
      </Text>
      <Text style={tw("w-1/4 px-4 py-2 text-sm text-left")}>
        {pair[0].value}
      </Text>

      {/* Vertikale Trennung */}
      <View style={tw("border-l border-gray-300")} />

      {/* Zweites Attribut-Wert-Paar */}
      {pair[1] ? (
        <>
          <Text
            style={tw(
              "w-1/4 px-4 py-2 text-sm text-left border-l border-gray-300"
            )}
          >
            {pair[1].label}
          </Text>
          <Text style={tw("w-1/4 px-4 py-2 text-sm text-left")}>
            {pair[1].value}
          </Text>
        </>
      ) : (
        // Falls kein zweites Paar vorhanden ist, leere Zellen einfügen
        <>
          <Text
            style={tw(
              "w-1/4 px-4 py-2 text-sm text-left border-l border-gray-300"
            )}
          ></Text>
          <Text style={tw("w-1/4 px-4 py-2 text-sm text-left")}></Text>
        </>
      )}
    </View>
  );
};

export default TableRow;

export const tw = createTw({
  theme: {
    fontFamily: {
      sans: ["Lato"],
    },
    extend: {
      colors: {
        custom: "cornflowerblue",
      },
    },
  },
});
