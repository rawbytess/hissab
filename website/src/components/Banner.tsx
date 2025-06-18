import React from "react";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";

export const Banner = () => {
  return (
    <a
      href="https://www.producthunt.com/posts/hissab?launch=hissab-2"
      target={"_blank"}
      className="cursor-pointer flex  justify-center gap-10 items-center text-light h-10 fixed top-0 z-50 w-full bg-black "
    >
      <Icon icon="fxemoji:partypopper" width="24" height="24" />
      <div className={"flex flex-row items-center gap-2"}>
        <p>We are live on ProductHunt</p>
        <Icon icon="logos:producthunt" width="24" height="24" />
      </div>
      <div className={"flex flex-row items-center gap-2"}>
        <p> Meet us there.</p>
        <Icon icon="noto:partying-face" width="24" height="24" />
      </div>
    </a>
  );
};
