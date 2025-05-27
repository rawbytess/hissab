import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { modelRateLimits } from "../../../../lib/types/AITypes.ts";

export default function Price() {
  return (
    <div className="flex flex-col items-center w-full mt-5 text-[#efefef]">
      <h1 className="text-4xl font-bold">App Subscriptions</h1>
      <p className="mt-4 text-lg">Choose a plan that suits your needs.</p>
      <div className={"flex flex-row flex-wrap gap-8 m-5"}>
        <Card
          className={
            "w-[25em] h-[40em] shadow bg-stone-900 p-4 rounded-xl ring-2 ring-stone-600"
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
            <Button className={"mx-auto w-full"}>Free</Button>
          </CardFooter>
        </Card>
        <Card
          className={
            "w-[25em] h-[40em]  shadow-xl bg-cyan-950 p-4 rounded-xl ring-2 ring-cyan-700"
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
                  medium size LLM models
                </p>
              </li>
              <li className={"grid grid-cols-[auto_1fr] gap-2 items-center"}>
                <Icon
                  icon="meteor-icons:check-double"
                  color={"green"}
                  width={20}
                />
                <p>Text prompts</p>
              </li>
              <li className={"grid grid-cols-[auto_1fr] gap-2 items-center"}>
                <Icon icon="entypo:cross" color={"red"} width={20} />
                <p>No access to large size LLM models.</p>
              </li>
              <li className={"grid grid-cols-[auto_1fr] gap-2 items-center"}>
                <Icon icon="entypo:cross" color={"red"} width={20} />
                <p>No file attachments</p>
              </li>
            </ul>
          </CardBody>
          <CardFooter className={"mt-auto flex flex-col gap-2"}>
            <Button className={"mx-auto w-full bg-cyan-700"}>$8 / month</Button>
            <Button className={"mx-auto w-full bg-cyan-700"}>$50 / year</Button>
            <p className={"text-xs text-gray-400"}>Cancel Anytime</p>
          </CardFooter>
        </Card>
        <Card
          className={
            "w-[25em] h-[40em]  shadow bg-fuchsia-950 p-4 rounded-xl ring-2 ring-fuchsia-700"
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
                  medium size LLM models
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
                  large size LLM models
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
            </ul>
          </CardBody>
          <CardFooter className={"mt-auto flex flex-col gap-2"}>
            <Button className={"mx-auto bg-fuchsia-700 w-full"}>
              $15 / month
            </Button>
            <Button className={"mx-auto bg-fuchsia-700 w-full"}>
              $100 / year
            </Button>
            <p className={"text-xs text-gray-400"}>Cancel Anytime</p>
          </CardFooter>
        </Card>
      </div>
      <div className="text-sm text-gray-400">
        <p>
          *Small LLMs are used for inline AI prompts and chat. They are fast and
          good for small prompts.
        </p>
        <p>*Medium LLMs are good for medium complexity prompts.</p>
        <p>
          *Large LLMs should be used for large, complex prompts. They involve
          thinking and chain of thought.
        </p>
        <br />
        <p>
          *The LLMs can make mistake in producing the correct hissab expression.
          Always check the generated expressions.
        </p>
        <p>
          *If the prompt needs calculations that hissab does not support, the
          LLMs will try to calculate themselves.
          <br /> This can also happen if the wrong expressions were generated
          and hissab engine was not able to calculate those expressions.
        </p>
      </div>
    </div>
  );
}
