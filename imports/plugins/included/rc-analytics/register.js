import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "rc-analytics",
  name: "rc-analytics",
  icon: "fa fa-bar-chart",
  autoEnable: true,
  settings: {
    name: "rc-analytics"
  },
  registry: [
    {
      route: "/dashboard/rc-analytics",
      provides: "dashboard",
      name: "rc-analytics",
      label: "Analytics",
      description: "View analytics report",
      icon: "fa fa-bar-chart",
      priority: 1,
      container: "connect",
      workflow: "coreDashboardWorkflow",
      template: "rcAnalytics"
    }
  ]
});
