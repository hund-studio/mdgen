import { create } from "@orama/orama";

const dbCreate = () =>
  create({
    schema: {
      title: "string",
      content: "string",
      href: "string",
    },
  });

export default dbCreate;
