// fallow-ignore-file coverage-gaps
import { appConfig } from "@canaveral/config";
import { createStarterSvgProject } from "@canaveral/svg";
import { Text, View } from "react-native";

const starterProject = createStarterSvgProject("Launch sequence");

/** Starter mobile home screen. */
export default function Index() {
  return (
    <View style={{ flex: 1, gap: 14, justifyContent: "center", padding: 24 }}>
      <Text style={{ color: "#166534", fontSize: 14, fontWeight: "700" }}>{appConfig.name}</Text>
      <Text style={{ color: "#0f172a", fontSize: 32, fontWeight: "700" }}>SVG Animator</Text>
      <Text style={{ color: "#334155", fontSize: 16 }}>
        Create an account, open animation projects, invite collaborators by email, and export
        standalone animated SVGs from the mobile entry point.
      </Text>
      <View style={{ backgroundColor: "#f8fafc", borderRadius: 8, gap: 6, padding: 14 }}>
        <Text style={{ color: "#0f172a", fontSize: 18, fontWeight: "700" }}>
          {starterProject.name}
        </Text>
        <Text style={{ color: "#475569" }}>
          {starterProject.elements.length} elements, {starterProject.keyframes.length} keyframes
        </Text>
      </View>
    </View>
  );
}
