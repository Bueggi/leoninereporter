import { View, Text } from "@react-pdf/renderer";
import { createTw } from "react-pdf-tailwind";
import adformatNames from "../../../lib/dashboard/AdFormatNames";
import { FliessText } from "@lib/dashboard/pdfGeneration/helperFunctions";
import { numberToEUR } from "@lib/dashboard/pdfGeneration/helperFunctions";

const ProductInformationRow = ({ productMetrics, product }) => {
  let text = "";
  let tkp;
  let reach;
  let budget;

  const filteredAdNameList = adformatNames.filter(
    (adFormat) => adFormat.name === product
  );

  if (filteredAdNameList.length === 0) {
    text = product;
    tkp = numberToEUR(productMetrics.tkp);
    reach = productMetrics.reach;
    budget = numberToEUR(productMetrics.reach * productMetrics.tkp / 1000);
  } else {
    text = filteredAdNameList[0].displayName;
    tkp = productMetrics[product].tkp;
    reach = productMetrics[product].reach;
    budget = productMetrics[product].budget;
  }

  return (
    <FliessText>
      <View style={tw("flex flex-row")}>
        <View style={tw("flex-1 flex flex-row items-center gap-3")}>
          <Text>{text}</Text>
        </View>
        <Text style={tw("w-20 text-right")}>{tkp}</Text>
        <Text style={tw("w-24 text-right")}>
          {new Intl.NumberFormat("de-DE").format(reach)}
        </Text>
        <Text style={tw("w-24 text-right")}>{budget}</Text>
      </View>
    </FliessText>
  );
};

export const tw = createTw({
  theme: {
    fontFamily: {
      sans: ["Inter"],
    },
    extend: {
      colors: {
        black: "#000000",
        white: "#FFFFFF",
        gray: {
          100: "#F5F5F5",
          200: "#E5E5E5",
          300: "#D4D4D4",
          400: "#A3A3A3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
        },
      },
    },
  },
});

export default ProductInformationRow;
