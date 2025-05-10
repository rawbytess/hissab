import { Card, CardBody, CardFooter, CardHeader, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";
import { modelRateLimits, ModelsMap } from "../../../../lib/types/AITypes.ts";

export default function Pricing() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full mt-5 text-[#efefef]">
      <h1 className="text-4xl font-bold">App Subscriptions</h1>
      <p className="mt-4 text-lg">Choose a plan that suits your needs.</p>
      <div className={"flex flex-row flex-wrap gap-8 m-5"}>
        <Card
          className={
            "w-[25em] h-[35em] shadow bg-stone-700 p-4 rounded-xl ring-2 ring-purple-700"
          }
        >
          <CardHeader>
            <div
              className={
                "flex flex-col gap-2 items-center justify-center w-full"
              }
            >
              <p className={"font-bold text-4xl mx-auto text-center"}>Free</p>
              <p className={"text-xs text-center text-gray-300"}>
                No Commitments, No Signup, No Ads, No BS
              </p>
            </div>
          </CardHeader>
          <Divider className={"px-2 my-2 border-gray-500"} />
          <CardBody className={""}>
            <ul className={"text-sm flex flex-col gap-2"}>
              <li className={"grid grid-cols-[auto_1fr] gap-2 items-center"}>
                <Icon
                  icon="meteor-icons:check-double"
                  color={"green"}
                  width={20}
                />
                <p>All classic calculations</p>
              </li>
              <li className={"grid grid-cols-[auto_1fr] gap-2 items-center"}>
                <Icon
                  icon="meteor-icons:check-double"
                  color={"green"}
                  width={20}
                />
                <p>Limited Support</p>
              </li>
              <li className={"grid grid-cols-[auto_1fr] gap-2 items-center"}>
                <Icon icon="entypo:cross" color={"red"} width={20} />
                <p>No AI Features</p>
              </li>
            </ul>
          </CardBody>
          <CardFooter className={"mt-auto"}>
            <div
              className={
                "mx-auto bg-[#1c1c1c] p-2 rounded-lg w-[80%] text-center drop-shadow-2xl"
              }
            >
              Free
            </div>
          </CardFooter>
        </Card>
        <Card
          className={
            "w-[25em] h-[35em]  shadow-xl bg-cyan-950 p-4 rounded-xl ring-2 ring-purple-700"
          }
        >
          <CardHeader>
            <div
              className={
                "flex flex-col gap-2 items-center justify-center w-full"
              }
            >
              <p className={"font-bold text-4xl mx-auto text-center"}>
                AI Lite
              </p>
              <p className={"text-sm text-center text-gray-300"}>
                Quick, casual calculations with AI
              </p>
            </div>
          </CardHeader>
          <Divider className={"px-2 my-2 border-gray-500"} />
          <CardBody className={""}>
            <ul className={"text-sm flex flex-col gap-2"}>
              <li className={"grid grid-cols-[auto_1fr] gap-2 items-center"}>
                <Icon
                  icon="meteor-icons:check-double"
                  color={"green"}
                  width={20}
                />
                <p>AI Enhanced</p>
              </li>
              <li className={"grid grid-cols-[auto_1fr] gap-2 items-center"}>
                <Icon
                  icon="meteor-icons:check-double"
                  color={"green"}
                  width={20}
                />
                <p>Inline AI prompts for quick calculations</p>
              </li>
              <li className={"grid grid-cols-[auto_1fr] gap-2 items-center"}>
                <Icon
                  icon="meteor-icons:check-double"
                  color={"green"}
                  width={20}
                />
                <p>AI Chat for more complex prompts</p>
              </li>
              <li className={"grid grid-cols-[auto_1fr] gap-2 items-center"}>
                <Icon
                  icon="meteor-icons:check-double"
                  color={"green"}
                  width={20}
                />
                <p>
                  {modelRateLimits["small"]["AI Lite"]} prompts / day using
                  small size LLM models
                </p>
              </li>
              <li className={"grid grid-cols-[auto_1fr] gap-2 items-center"}>
                <Icon
                  icon="meteor-icons:check-double"
                  color={"green"}
                  width={20}
                />
                <p>
                  {modelRateLimits["medium"]["AI Lite"]} prompts / day using
                  Medium size LLM models
                </p>
              </li>
              <li className={"grid grid-cols-[auto_1fr] gap-2 items-center"}>
                <Icon icon="entypo:cross" color={"red"} width={20} />
                <p>No access to Large size LLM models.</p>
              </li>
              <li className={"grid grid-cols-[auto_1fr] gap-2 items-center"}>
                <Icon icon="entypo:cross" color={"red"} width={20} />
                <p>No file attachments</p>
              </li>
              <li className={"grid grid-cols-[auto_1fr] gap-2 items-center"}>
                <Icon icon="entypo:cross" color={"red"} width={20} />
                <p>Only text prompts</p>
              </li>
            </ul>
          </CardBody>
          <CardFooter className={"mt-auto flex flex-col gap-2"}>
            <div
              className={
                "mx-auto bg-cyan-800 p-2 rounded-lg w-[80%] text-center drop-shadow-2xl"
              }
            >
              $8 / month
            </div>
            <div
              className={
                "mx-auto bg-cyan-700 p-2 rounded-lg w-[80%] text-center drop-shadow-2xl"
              }
            >
              $50 / year
            </div>
          </CardFooter>
        </Card>
        <Card
          className={
            "w-[25em] h-[35em]  shadow bg-teal-950 p-4 rounded-xl ring-2 ring-purple-700"
          }
        >
          <CardHeader>
            <div
              className={
                "flex flex-col gap-2 items-center justify-center w-full"
              }
            >
              <p className={"font-bold text-4xl mx-auto text-center"}>
                AI Plus
              </p>
              <p className={"text-sm text-center text-gray-300"}>
                Enhance productivity to the next level
              </p>
            </div>
          </CardHeader>
          <Divider className={"px-2 my-2 border-gray-500"} />
          <CardBody className={""}>
            <ul className={"text-sm flex flex-col gap-2"}>
              <li className={"grid grid-cols-[auto_1fr] gap-2 items-center"}>
                <Icon
                  icon="meteor-icons:check-double"
                  color={"green"}
                  width={20}
                />
                <p>AI Enhanced</p>
              </li>
              <li className={"grid grid-cols-[auto_1fr] gap-2 items-center"}>
                <Icon
                  icon="meteor-icons:check-double"
                  color={"green"}
                  width={20}
                />
                <p>Inline AI prompts for quick calculations</p>
              </li>
              <li className={"grid grid-cols-[auto_1fr] gap-2 items-center"}>
                <Icon
                  icon="meteor-icons:check-double"
                  color={"green"}
                  width={20}
                />
                <p>AI Chat for more complex prompts</p>
              </li>
              <li className={"grid grid-cols-[auto_1fr] gap-2 items-center"}>
                <Icon
                  icon="meteor-icons:check-double"
                  color={"green"}
                  width={20}
                />
                <p>
                  {modelRateLimits["small"]["AI Plus"]} prompts / day using
                  small size LLM models
                </p>
              </li>
              <li className={"grid grid-cols-[auto_1fr] gap-2 items-center"}>
                <Icon
                  icon="meteor-icons:check-double"
                  color={"green"}
                  width={20}
                />
                <p>
                  {modelRateLimits["medium"]["AI Plus"]} prompts / day using
                  Medium size LLM models
                </p>
              </li>
              <li className={"grid grid-cols-[auto_1fr] gap-2 items-center"}>
                <Icon
                  icon="meteor-icons:check-double"
                  color={"green"}
                  width={20}
                />
                <p>
                  {modelRateLimits["large"]["AI Plus"]} prompts / day using
                  Large size LLM models
                </p>
              </li>
              <li className={"grid grid-cols-[auto_1fr] gap-2 items-center"}>
                <Icon
                  icon="meteor-icons:check-double"
                  color={"green"}
                  width={20}
                />
                <p>Multimodal, supports images and pdfs</p>
              </li>
              <li className={"grid grid-cols-[auto_1fr] gap-2 items-center"}>
                <Icon
                  icon="meteor-icons:check-double"
                  color={"green"}
                  width={20}
                />
                <p>File attachments</p>
              </li>
              <li className={"grid grid-cols-[auto_1fr] gap-2 items-center"}>
                <Icon
                  icon="meteor-icons:check-double"
                  color={"green"}
                  width={20}
                />
                <p>Detail explanation for prompts</p>
              </li>
            </ul>
          </CardBody>
          <CardFooter className={"mt-auto flex flex-col gap-2"}>
            <div
              className={
                "mx-auto bg-teal-800 p-2 rounded-lg w-[80%] text-center drop-shadow-2xl"
              }
            >
              $15 / month
            </div>
            <div
              className={
                "mx-auto bg-teal-700 p-2 rounded-lg w-[80%] text-center drop-shadow-2xl"
              }
            >
              $100 / year
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
