import { AnimatedBanner } from "./AnimatedBanner";

export function ErrorBanner({ message }) {
  if (!message) return null;

  return (
    <AnimatedBanner
      type="error"
      title={message}
      message="Controleer de huidige beurt, zone en contractregel."
    />
  );
}
