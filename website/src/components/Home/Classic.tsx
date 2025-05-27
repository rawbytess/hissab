import { useEffect, useState } from "react";
import {
  Tabs,
  Tab,
  Card,
  CardBody,
  Switch,
  CardHeader,
  Button,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import HissabExample from "@/components/HissabExample.tsx";
import Video from "@/components/Video.tsx";

const expressions = {
  basic: "10 + 20 -15* 5/10\n22* (10^3) -16\navg(1,2,3,4)\n",
  percentage:
    "150 + 33%\n67.7% of 1234\n22% off 345\n37% of what is 690\n10% of 1000 - 5%\n",
  units:
    "13 miles to km\n" +
    "5 days 3 hours 12 minutes 40 seconds to hours, minutes,seconds\n" +
    "12 tsp + 3 tbsp + 2 cups\n" +
    "5K kelvin to fahrenheit\n" +
    "30 million /30M\n" +
    "3 hundred seconds to minutes",
  datetime:
    "5 june 2004 + 2 months + 1 year\n" +
    "06:23 pm - 4 hr\n" +
    "06.08.1995 9:23 pm - 15 feb 1995 3:42 am to days,hours\n" +
    "time\n" +
    "time in new york\n" +
    "2023.05.22 7:30 am in tokyo",
  academic:
    "5 perm 3\n5! + 3!\nlog 1000\ngcd(3,36,60,12)\nstandard deviation(3,36,60,12)\ncos 60",
  computational:
    "0b10101010 xor 0b1100110\n0b10101010 << 3 to decimal\nrgb(129, 0, 255) to hex\n#efefef - 1.3\n0O214562 + 0xa2f3e46 to binary",
  crazy:
    "(0b10101010 xor 0b1100110) + (0b10101010 << avg((12 /4), 5!/(6 comb 3), sin 60/cos 60)) to decimal\n(0o1241212 to hex) kg + avg(1200 gram, 40 *10^5 microgram, 45 carat) to pound to decimal\n20 mar 1987 3:30 pm + (06.12.2023 - 08.09.2024) + 2 months - (234 hours to days) to epoch\n",
};

function Classic() {
  const [windowWidth, setWindowWidth] = useState(0);
  const handleResize = () => {
    setWindowWidth(window.innerWidth);
  };
  useEffect(() => {
    setWindowWidth(window.innerWidth); // Accessing window API safely on the client
    window.addEventListener("resize", handleResize);
  }, []);
  return (
    <section className="flex flex-col w-full text-light">
      <h2
        className={
          "text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-blue-400 to-teal-500 mb-5"
        }
      >
        Powerful without AI...
      </h2>

      <div className="flex items-center flex-col ring-2 promo-imgs ring-stone-600 mb-10">
        <Tabs
          aria-label="Options"
          isVertical={windowWidth > 640}
          className={"items-center"}
          classNames={{
            tabWrapper: "w-full",
            tabList: `${windowWidth < 640 ? "flex-wrap" : ""} bg-stone-900`,
            panel: "bg-stone-900 rounded-r-2xl w-full",
            base: "py-4 pl-2 bg-stone-900 rounded-l-2xl",
            tab: "justify-start",
          }}
        >
          <Tab
            key="basic"
            title={
              <div className={"flex flex-row gap-2 items-center"}>
                <Icon
                  icon={"solar:calculator-minimalistic-bold"}
                  width={16}
                  className={""}
                  color="#FF6E49"
                />
                Basic Calculations
              </div>
            }
          >
            <HissabExample
              text={expressions.basic}
              className={"bg-stone-900 w-full my-0 rounded-l-none"}
            />
          </Tab>
          <Tab
            key="percentage"
            title={
              <div className={"flex flex-row gap-2 items-center"}>
                <Icon
                  icon={"mdi:percent-box"}
                  width={16}
                  className={"rotate-45"}
                  color="#E0FF3C"
                />
                Percentages
              </div>
            }
          >
            <HissabExample
              text={expressions.percentage}
              className={"bg-stone-900 w-full my-0 rounded-l-none"}
            />
          </Tab>
          <Tab
            key="units"
            title={
              <div className={"flex flex-row gap-2 items-center"}>
                <Icon
                  icon={"solar:refresh-square-bold"}
                  width={16}
                  className={""}
                  color="#53FF79"
                />
                Unit conversion
              </div>
            }
          >
            <HissabExample
              text={expressions.units}
              className={"bg-stone-900 w-full  my-0 rounded-l-none"}
            />
          </Tab>
          <Tab
            key="datetime"
            title={
              <div className={"flex flex-row gap-2 items-center"}>
                <Icon
                  icon={"clarity:date-solid"}
                  width={16}
                  className={""}
                  color="#2CFFF8"
                />
                Date, time and timezone
              </div>
            }
          >
            <HissabExample
              text={expressions.datetime}
              className={"bg-stone-900 w-full  my-0 rounded-l-none"}
            />
          </Tab>
          <Tab
            key="acedemic"
            title={
              <div className={"flex flex-row gap-2 items-center"}>
                <Icon
                  icon={"solar:square-academic-cap-bold"}
                  width={16}
                  className={""}
                  color="#4286FF"
                />
                Academic and Scientific Maths
              </div>
            }
          >
            <HissabExample
              text={expressions.academic}
              className={"bg-stone-900 w-full  my-0 rounded-l-none"}
            />
          </Tab>
          <Tab
            key="computational"
            title={
              <div className={"flex flex-row gap-2 items-center"}>
                <Icon
                  icon={"ph:binary-fill"}
                  width={16}
                  className={""}
                  color="#FF46F8"
                />
                Computational Maths
              </div>
            }
          >
            <HissabExample
              text={expressions.computational}
              className={"bg-stone-900 w-full  my-0 rounded-l-none"}
            />
          </Tab>
          <Tab
            key="crazy"
            title={
              <div className={"flex flex-row gap-2 items-center"}>
                <Icon
                  icon={"streamline-emojis:crazy-face"}
                  width={16}
                  className={""}
                  color="#efefef"
                />
                Go Crazy!
              </div>
            }
          >
            <HissabExample
              text={expressions.crazy}
              className={"bg-stone-900 w-full  my-0 rounded-l-none"}
            />
          </Tab>
        </Tabs>
      </div>
      <div className={"flex flex-row flex-wrap gap-8 my-10"}>
        <Card className={"ring-1 ring-stone-600 max-w-[20em] bg-stone-900 "}>
          <CardHeader className={"justify-start p-0"}>
            <Video src={"/videos/organization.mp4"} />
          </CardHeader>
          <CardBody className={"flex flex-col justify-start text-gray-300"}>
            <p className={"text-lg font-medium"}>Pages</p>
            <p className={"text-sm text-gray-400"}>
              Organize calculations in multiple pages.
            </p>
          </CardBody>
        </Card>
        <Card className={"ring-1 ring-stone-600 max-w-[20em] bg-stone-900 "}>
          <CardHeader className={"justify-start p-0"}>
            <Video src={"/videos/vars.mp4"} />
          </CardHeader>
          <CardBody className={"flex flex-col justify-start text-gray-300"}>
            <p className={"text-lg font-medium"}>Variables</p>
            <p className={"text-sm text-gray-400"}>
              Store or refer to results from previous lines using custom
              variable name, line number or prev keyword
            </p>
          </CardBody>
        </Card>
        <Card className={"ring-1 ring-stone-600 max-w-[20em] bg-stone-900 "}>
          <CardHeader className={"justify-start p-0"}>
            <Video src={"/videos/cascade.mp4"} />
          </CardHeader>
          <CardBody className={"flex flex-col justify-start text-gray-300"}>
            <p className={"text-lg font-medium"}>Cascade results</p>
            <p className={"text-sm text-gray-400"}>
              Use the results of previous calculations in the following lines.
              The results will be automatically updated in real-time as you make
              changes.
            </p>
          </CardBody>
        </Card>
      </div>
      <Button className="mt-6 bg-blue-700" variant={"solid"}>
        <a href="/guide/introduction" className="">
          <p>Check out everything Hissab can do</p>
        </a>
      </Button>
    </section>
  );
}

export default Classic;
