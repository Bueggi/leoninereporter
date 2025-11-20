import { View, Text } from "@react-pdf/renderer";
import { createTw } from "react-pdf-tailwind";
import adformatNames from "../../../lib/dashboard/AdFormatNames";

const UpchargeInformationRow
 = ({ productMetrics, product }) => {
  return (
    <View style={tw("flex flex-row py-2.5 border-b border-gray-100")}>
      <View style={tw("flex-1 flex flex-row items-center gap-3")}>
        <Text style={tw("text-sm")}>Upcharge {}</Text>
      </View>
      <Text style={tw("w-20 text-right text-xs text-gray-600")}>
        {productMetrics[product].tkp}
      </Text>
      <Text style={tw("w-24 text-right text-xs text-gray-600")}>
        {new Intl.NumberFormat("de-DE").format(productMetrics[product].reach)}
      </Text>
      <Text style={tw("w-24 text-right text-xs text-gray-600")}>
        {productMetrics[product].budget}
      </Text>
    </View>
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

export default UpchargeInformationRow
;
