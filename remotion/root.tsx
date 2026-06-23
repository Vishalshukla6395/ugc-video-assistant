import {Composition} from "remotion";
import {UgcVideo, type UgcVideoProps} from "./ugc-video";

const defaultProps: UgcVideoProps = {
  strategy: {
    productName: "CalAI",
    productDescription: "A calorie tracking app that makes food logging fast.",
    targetAudience: "health-conscious creators and busy people",
    marketingAngle: "stop manually calculating calories",
    ugcCaption: "me manually counting calories for 20 minutes\nwhile calai does it in 2 seconds",
    gifSearchTerm: "confused math lady",
    backgroundSearchTerm: "fitness gym",
    audioMood: "upbeat playful"
  },
  assets: {
    gifUrl: "https://media.giphy.com/media/l4FGuhL4U2WyjdkaY/giphy.gif",
    backgroundUrl:
      "https://images.pexels.com/photos/5077047/pexels-photo-5077047.jpeg?auto=compress&cs=tinysrgb&w=1080"
  }
};

export function RemotionRoot() {
  return (
    <Composition
      id="UgcVideo"
      component={UgcVideo}
      durationInFrames={240}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={defaultProps}
    />
  );
}
