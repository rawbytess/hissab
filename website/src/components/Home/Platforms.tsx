import { Button, Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";

function Platforms() {
  return (
    <section>
      <h2
        className={
          "text-transparent bg-clip-text bg-gradient-to-r from-[#60C7F0] via-[#57C785] to-[#EDDD53]"
        }
      >
        Runs on Anything with a Screen
      </h2>
      <p className={"text-xl text-gray-400"}>
        Cross-Platform? Cross It Off Your Worry List
      </p>
      <div className={"flex flex-row flex-wrap justify-around gap-5 mt-5"}>
        <Tooltip
          content={"Web"}
          showArrow
          offset={0}
          closeDelay={0}
          delay={0}
          disableAnimation
          className={"text-white bg-neutral-700 rounded-2xl"}
        >
          <Icon icon={"streamline:web-solid"} width={30} color="#efefef" />
        </Tooltip>
        <div></div>
        <Tooltip
          content={"iOS as PWA"}
          showArrow
          offset={0}
          closeDelay={0}
          delay={0}
          disableAnimation
          className={"text-white bg-neutral-700 rounded-2xl"}
        >
          <Icon icon={"lineicons:ios"} width={30} color="#efefef" />
        </Tooltip>
        <Tooltip
          content={"Android as PWA"}
          showArrow
          offset={0}
          closeDelay={0}
          delay={0}
          disableAnimation
          className={"text-white bg-neutral-700 rounded-2xl"}
        >
          <Icon icon={"uil:android"} width={30} color="#efefef" />
        </Tooltip>
        <div></div>
        <Tooltip
          content={"MacOS as PWA"}
          showArrow
          offset={0}
          closeDelay={0}
          delay={0}
          disableAnimation
          className={"text-white bg-neutral-700 rounded-2xl"}
        >
          <Icon icon={"wpf:mac-os"} width={30} color="#efefef" />
        </Tooltip>
        <Tooltip
          content={"Windows as PWA"}
          showArrow
          offset={0}
          closeDelay={0}
          delay={0}
          disableAnimation
          className={"text-white bg-neutral-700 rounded-2xl"}
        >
          <Icon icon={"bi:windows"} width={30} color="#efefef" />
        </Tooltip>
        <Tooltip
          content={"Linux as PWA"}
          showArrow
          offset={0}
          closeDelay={0}
          delay={0}
          disableAnimation
          className={"text-white bg-neutral-700 rounded-2xl"}
        >
          <Icon icon={"ant-design:linux-outlined"} width={30} color="#efefef" />
        </Tooltip>
        <div></div>
        <Tooltip
          content={"Chrome Extension & ChromeOS"}
          showArrow
          offset={0}
          closeDelay={0}
          delay={0}
          disableAnimation
          className={"text-white bg-neutral-700 rounded-2xl"}
        >
          <Icon icon={"teenyicons:chrome-solid"} width={30} color="#efefef" />
        </Tooltip>
        <Tooltip
          content={"Chrome Extension on Edge"}
          showArrow
          offset={0}
          closeDelay={0}
          delay={0}
          disableAnimation
          className={"text-white bg-neutral-700 rounded-2xl"}
        >
          <Icon icon={"ri:edge-new-fill"} width={35} color="#efefef" />
        </Tooltip>
      </div>
      <Button className="mt-10 bg-blue-700">
        <a href="/installation" className="flex flex-col">
          <p>See how to install</p>
        </a>
      </Button>
    </section>
  );
}

export default Platforms;
