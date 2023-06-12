import type { V2_MetaFunction } from "@remix-run/node";
import { Form } from '@remix-run/react'

export const meta: V2_MetaFunction = () => {
  return [
    { title: "Lootsheet" },
    { name: "description", content: "Feed-based tool for tracking gained items / information in TTRPGs." },
  ];
};

export default function Index() {
  return (
    <div className="w-full my-10">
      <Form>
        <textarea className="rounded-md py-2 px-4 w-full bg-transparent focus:outline-none resize-none text-lg" autoFocus/>
      </Form>
    </div>
  );
}
