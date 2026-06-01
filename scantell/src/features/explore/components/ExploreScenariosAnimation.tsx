import { colors } from "@/lib/design-system";
import { LazyLottie } from "@/shared/components/LazyLottie";

export function ExploreScenariosAnimation() {
  return (
    <LazyLottie
      path="/explore-scenarios.json"
      speed={0.25}
      data-explore-lottie
      className="h-[220px] overflow-hidden"
      style={{ backgroundColor: colors.background.base }}
      lottieClassName="w-full h-[300px]"
      lottieStyle={{ mixBlendMode: "multiply", transform: "translateY(-5rem)" }}
    />
  );
}
