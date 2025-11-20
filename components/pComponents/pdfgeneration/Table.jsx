import { View, Text, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  table: {
    display: "table",
    width: "auto",
    marginVertical: 10,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
  },
  tableRow: {
    flexDirection: "row",
  },
  tableColHeader: {
    width: "33.33%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    backgroundColor: "#f0f0f0",
    padding: 5,
  },
  tableCol: {
    width: "33.33%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    padding: 5,
  },
  tableCellHeader: {
    fontSize: 12,
    fontWeight: "bold",
  },
  tableCell: {
    fontSize: 10,
  },
});

const Table = ({ data, headers }) => (
  <View style={styles.table}>
    <View style={styles.tableRow}>
      {headers.map((header, i) => (
        <View key={i} style={styles.tableColHeader}>
          <Text style={styles.tableCellHeader}>{header}</Text>
        </View>
      ))}
    </View>
    {data.map((row, i) => (
      <View key={i} style={styles.tableRow}>
        {row.map((cell, j) => (
          <View key={j} style={styles.tableCol}>
            <Text style={styles.tableCell}>{cell}</Text>
          </View>
        ))}
      </View>
    ))}
  </View>
);

export default Table;
