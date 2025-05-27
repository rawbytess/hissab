import { Image, type NavbarProps } from "@heroui/react";

import React from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  Link,
  Button,
  Divider,
} from "@heroui/react";

import { cn } from "@heroui/react";

export default function Header(props: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <Navbar
      {...props}
      className={"bg-[#530e97]"}
      classNames={{
        base: cn("border-default-100 text-light h-12", {
          "bg-[#530e97]": isMenuOpen,
        }),
        wrapper: "w-full justify-around",
        item: "hidden md:flex",
      }}
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
    >
      {/* Left Content */}
      <NavbarBrand>
        <Link href="/" className={"flex items-center gap-1 text-white"}>
          <Image
            src="/img/logomark.svg"
            className={"w-8 drop-shadow"}
            alt="Hissab logo"
          />
          <h1 className={"shadow"}>Hissab</h1>
        </Link>
      </NavbarBrand>

      {/* Center Content */}
      <NavbarContent justify="center" className={"gap-5"}>
        <NavbarItem>
          <Link className="text-light" href="/faqs" size="sm">
            Docs
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link className="text-light" href="/pricing" size="sm">
            Pricing
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link className="text-light" href="/roadmap" size="sm">
            Roadmap
          </Link>
        </NavbarItem>
      </NavbarContent>

      {/* Right Content */}
      <NavbarContent className="hidden md:flex" justify="end">
        <NavbarItem className="!flex gap-2">
          <Link
            href={"https://app.hissab.io"}
            target={"_blank"}
            className={
              "hissab-app-nav drop-shadow-2xl h-8 px-2 pt-1 text-white hover:text-[#efefef]"
            }
          >
            Hissab App
          </Link>
        </NavbarItem>
      </NavbarContent>

      <NavbarMenuToggle className="text-default-400 md:hidden" />

      <NavbarMenu className="top-[calc(var(--navbar-height)_-_1px)] max-h-fit bg-default-200/50 pb-6 pt-6 shadow-medium backdrop-blur-md backdrop-saturate-150 dark:bg-default-100/50">
        <NavbarMenuItem className="mb-4">
          <Link
            href={"https://app.hissab.io"}
            target={"_blank"}
            className={
              "hissab-app-nav drop-shadow-2xl shadow-2xl h-10 p-2 text-white hover:text-[#efefef]"
            }
          >
            Hissab App
          </Link>
        </NavbarMenuItem>
        <NavbarMenuItem>
          <Link className="mb-2 w-full text-default-500" href="#" size="md">
            Docs
          </Link>
        </NavbarMenuItem>
        <NavbarMenuItem>
          <Link className="mb-2 w-full text-default-500" href="#" size="md">
            Pricing
          </Link>
        </NavbarMenuItem>
        <NavbarMenuItem>
          <Link className="mb-2 w-full text-default-500" href="#" size="md">
            Roadmap
          </Link>
        </NavbarMenuItem>
      </NavbarMenu>
    </Navbar>
  );
}
