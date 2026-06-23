import {AbsoluteFill, Audio, Img, interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";
import type {AssetBundle, MarketingStrategy} from "../lib/types";

export type UgcVideoProps = {
  strategy: MarketingStrategy;
  assets: AssetBundle;
};

export function UgcVideo({strategy, assets}: UgcVideoProps) {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const scale = interpolate(frame, [0, durationInFrames], [1.08, 1.18]);
  const stickerPop = spring({frame: frame - 28, fps, config: {damping: 11, stiffness: 150}});
  const textIn = spring({frame: frame - 8, fps, config: {damping: 14, stiffness: 120}});
  const secondTextIn = spring({frame: frame - 88, fps, config: {damping: 14, stiffness: 120}});
  const [lineOne, ...rest] = strategy.ugcCaption.split("\n").filter(Boolean);
  const lineTwo = rest.join(" ") || strategy.marketingAngle;

  return (
    <AbsoluteFill style={{backgroundColor: "#101010", fontFamily: "Inter, Arial, sans-serif", overflow: "hidden"}}>
      <AbsoluteFill>
        <Img
          src={assets.backgroundUrl}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${scale})`,
            filter: "saturate(1.08) contrast(1.04)"
          }}
        />
        <AbsoluteFill
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.12) 38%, rgba(0,0,0,0.72) 100%)"
          }}
        />
      </AbsoluteFill>

      <div
        style={{
          position: "absolute",
          top: 72,
          left: 64,
          right: 64,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "white"
        }}
      >
        <div
          style={{
            padding: "18px 26px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.2)",
            backdropFilter: "blur(18px)",
            fontSize: 34,
            fontWeight: 800,
            border: "2px solid rgba(255,255,255,0.26)"
          }}
        >
          {strategy.productName}
        </div>
        <div style={{fontSize: 30, fontWeight: 900}}>UGC AD</div>
      </div>

      <MemeText
        text={lineOne}
        top={210}
        opacity={Math.min(1, textIn)}
        translateY={interpolate(textIn, [0, 1], [34, 0])}
      />

      <div
        style={{
          position: "absolute",
          left: 150,
          right: 150,
          top: 690,
          height: 520,
          transform: `scale(${Math.max(0, stickerPop)}) rotate(${interpolate(frame, [0, 40, 80], [-4, 3, -2], {
            extrapolateRight: "clamp"
          })}deg)`,
          opacity: frame < 28 ? 0 : 1,
          borderRadius: 42,
          overflow: "hidden",
          border: "12px solid white",
          boxShadow: "0 34px 90px rgba(0,0,0,0.48)",
          background: "white"
        }}
      >
        <Img src={assets.gifUrl} style={{width: "100%", height: "100%", objectFit: "cover"}} />
      </div>

      <MemeText
        text={lineTwo}
        top={1270}
        opacity={Math.min(1, secondTextIn)}
        translateY={interpolate(secondTextIn, [0, 1], [42, 0])}
        accent
      />

      <div
        style={{
          position: "absolute",
          left: 76,
          right: 76,
          bottom: 92,
          padding: "28px 32px",
          borderRadius: 34,
          background: "rgba(0,0,0,0.62)",
          color: "white",
          fontSize: 34,
          lineHeight: 1.25,
          fontWeight: 700,
          border: "2px solid rgba(255,255,255,0.18)"
        }}
      >
        {strategy.productDescription}
      </div>

      {assets.audioUrl ? <Audio src={assets.audioUrl} volume={0.18} /> : null}
    </AbsoluteFill>
  );
}

function MemeText({
  text,
  top,
  opacity,
  translateY,
  accent = false
}: {
  text: string;
  top: number;
  opacity: number;
  translateY: number;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 54,
        right: 54,
        opacity,
        transform: `translateY(${translateY}px)`,
        textAlign: "center",
        color: accent ? "#fff36e" : "white",
        fontSize: 82,
        lineHeight: 1.02,
        fontWeight: 1000,
        letterSpacing: 0,
        textTransform: "lowercase",
        WebkitTextStroke: "4px #111",
        textShadow: "0 10px 0 #111, 0 20px 36px rgba(0,0,0,0.35)"
      }}
    >
      {text}
    </div>
  );
}
