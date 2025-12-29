// ------------------------------------------------------------
// index.js
// ------------------------------------------------------------
import { ctlConsumerResource } from "./consumer-resource.controller.js";
import { ctlConsumerResource2 } from "./consumer-resource.controller2.js";

export const consumerResourceModule = {
  ctx: "sys",

  moduleId: "moduleman-consumer-resource",
  moduleName: "consumer-resource",
  moduleGuid: "consr-0001-0000-0000",

  controllers: [
    { name: "consumer-resource", instance: ctlConsumerResource, template: ctlConsumerResource.__template(), default: false, },
    { name: "consumer-resource2", instance: ctlConsumerResource2, template: ctlConsumerResource2.__template(), default: false, }
  ],

  menu: [
    {
      label: "consumer",
      route: "sys/consumer",
      children: [
        {
          label: "consumer-resource",
          itemType: "route",
          route: "sys/moduleman/consumer-resource",
          template: ctlConsumerResource.__template(),
        },
      ],
    },
    {
      label: "consumer2",
      route: "sys/consumer2",
      children: [
        {
          label: "consumer-resource2",
          itemType: "route",
          route: "sys/moduleman/consumer-resource2",
          template: ctlConsumerResource2.__template(),
        },
      ],
    },
  ],
};

export const module = consumerResourceModule;
