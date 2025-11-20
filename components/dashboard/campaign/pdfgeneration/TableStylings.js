import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { createTw } from "react-pdf-tailwind";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "tomato",
    fontWeight: "bold",
    fontFamily: "Times-Bold",
  },
  section: { color: "white", textAlign: "center", margin: 30 },
  wrapper: {
    display: "flex",
    width: "100%",
    flexDirection: "row",
    fontSize: "11px",
    marginBottom: "4px",
  },
  valueWrapper: { display: "flex", width: "100%", flexDirection: "row" },
  label: {
    flex: "0 0 40%",
    minWidth: "40%",
    maxWidth: "40%",
    paddingLeft: "10px",
  },
  values: {
    flex: "0 0 33%",
    textAlign: "right",
    paddingRight: "12px",
    right: "0px",
    minWidth: "33%",
    maxWidth: "33%",
  },
  right: { right: "0px" },
  title: {
    fontSize: "11px",
    padding: "4px 0 4px 0",
  },
});

const InformationRow = ({ label, tkp, reach, budget }) => {
  return (
    <View style={styles.wrapper}>
      <View style={styles.label}>
        <Text>{label}</Text>
      </View>
      <View style={styles.valueWrapper}>
        <View style={styles.values}>
          <Text>{tkp}</Text>
        </View>
        <View style={styles.values}>
          <Text>{reach}</Text>
        </View>
        <View style={styles.values}>
          <Text>{budget}</Text>
        </View>
      </View>
    </View>
  );
};

const TitleRow = ({ label, tkp, reach, budget, color, fontColor, font }) => {
  return (
    <View
      style={[
        styles.wrapper,
        styles.title,
        { backgroundColor: color, color: fontColor, fontFamily: font },
      ]}
    >
      <View style={styles.label}>
        <Text>{label}</Text>
      </View>
      <View style={styles.valueWrapper}>
        <View style={styles.values}>
          <Text>{tkp}</Text>
        </View>
        <View style={styles.values}>
          <Text>{reach}</Text>
        </View>
        <View style={styles.values}>
          <Text>{budget}</Text>
        </View>
      </View>
    </View>
  );
};

const TableHeader = () => (
  <View style={tw(`flex flex-row bg-gray-200 border-b border-gray-300`)}>
    <View style={tw(`flex-2 p-2`)}>
      <Text style={tw(`text-sm font-bold text-gray-800`)}>
        Home of Talents Media
      </Text>
    </View>
    <View style={tw(`flex-1 p-2 text-right`)}>
      <Text style={tw(`text-sm font-bold text-gray-800`)}>TKP(net)</Text>
    </View>
    <View style={tw(`flex-1 p-2 text-right`)}>
      <Text style={tw(`text-sm font-bold text-gray-800`)}>AIs</Text>
    </View>
    <View style={tw(`flex-1 p-2 text-right`)}>
      <Text style={tw(`text-sm font-bold text-gray-800`)}>Budget (net)</Text>
    </View>
  </View>
);

const TableRows = ({ label, tkp, reach, budget }) => (
  <View style={styles.page}>
    <View style={tw(`flex-2 p-2 bg-indigo-200`)}>
      <Text style={tw(`text-sm text-gray-700`)}>{label}</Text>
    </View>
    <View style={tw(`flex-1 p-2 text-right`)}>
      <Text style={tw(`text-sm text-gray-700`)}>{tkp} €</Text>
    </View>
    <View style={tw(`flex-1 p-2 text-right`)}>
      <Text style={tw(`text-sm text-gray-700`)}>
        {new Intl.NumberFormat("de-DE").format(reach)}
      </Text>
    </View>
    <View style={tw(`flex-1 p-2 text-right`)}>
      <Text style={tw(`text-sm text-gray-700`)}>{budget} €</Text>
    </View>
  </View>
);

const TableFooter = ({ label, reach, budget }) => (
  <View style={tw(`flex flex-row bg-gray-700 text-white`)}>
    <View style={tw(`flex-2 p-2`)}>
      <Text>{label}</Text>
    </View>
    <View style={tw(`flex-1 p-2 text-right`)}>
      <Text>{new Intl.NumberFormat("de-DE").format(reach)}</Text>
    </View>
    <View style={tw(`flex-1 p-2 text-right`)}>
      <Text>{budget} €</Text>
    </View>
    <View style={tw(`flex-1 p-2 text-right`)}></View>{" "}
    {/* Leeres Feld für die letzte Spalte */}
  </View>
);

const UpchargeTableHeader = () => (
  <View style={tw(`flex flex-row bg-gray-200 border-b border-gray-300`)}>
    <View style={tw(`flex-2 p-2`)}>
      <Text style={tw(`text-sm font-bold text-gray-800`)}>
        Upcharge Details
      </Text>
    </View>
    <View style={tw(`flex-1 p-2 text-right`)}>
      <Text style={tw(`text-sm font-bold text-gray-800`)}>TKP(net)</Text>
    </View>
    <View style={tw(`flex-1 p-2 text-right`)}>
      <Text style={tw(`text-sm font-bold text-gray-800`)}>Reichweite</Text>
    </View>
    <View style={tw(`flex-1 p-2 text-right`)}>
      <Text style={tw(`text-sm font-bold text-gray-800`)}>Kosten</Text>
    </View>
  </View>
);

const UpchargeTableRow = ({ label, tkp, reach, cost }) => (
  <View style={tw(`flex flex-row border-b border-gray-300`)}>
    <View style={tw(`flex-2 p-2`)}>
      <Text style={tw(`text-sm text-gray-700`)}>{label}</Text>
    </View>
    <View style={tw(`flex-1 p-2 text-right`)}>
      <Text style={tw(`text-sm text-gray-700`)}>
        {tkp
          ? new Intl.NumberFormat("de-DE", {
              style: "currency",
              currency: "EUR",
            }).format(tkp)
          : ""}
      </Text>
    </View>
    <View style={tw(`flex-1 p-2 text-right`)}>
      <Text style={tw(`text-sm text-gray-700`)}>
        {reach ? new Intl.NumberFormat("de-DE").format(reach) : ""}
      </Text>
    </View>
    <View style={tw(`flex-1 p-2 text-right`)}>
      <Text style={tw(`text-sm text-gray-700`)}>
        {cost
          ? new Intl.NumberFormat("de-DE", {
              style: "currency",
              currency: "EUR",
            }).format(cost)
          : ""}
      </Text>
    </View>
  </View>
);

export {
  TableFooter,
  TableHeader,
  TableRows,
  UpchargeTableHeader,
  UpchargeTableRow,
  InformationRow,
  TitleRow,
};

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
