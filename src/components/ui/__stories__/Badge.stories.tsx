import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Badge } from "../badge";

const meta: Meta<typeof Badge> = {
  title: "UI/Badge",
  component: Badge,
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline", "success", "warning"],
    },
  },
  args: {
    children: "Badge",
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {};

export const Secondary: Story = {
  args: { variant: "secondary", children: "SINGLE IMAGE" },
};

export const Destructive: Story = {
  args: { variant: "destructive", children: "high" },
};

export const Outline: Story = {
  args: { variant: "outline", children: "Demo" },
};

export const Success: Story = {
  args: { variant: "success", children: "Completed" },
};

export const Warning: Story = {
  args: { variant: "warning", children: "medium" },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">High Priority</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="success">Completed</Badge>
      <Badge variant="warning">Warning</Badge>
    </div>
  ),
};

export const AgentBadges: Story = {
  name: "Agent Crew Badges",
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="secondary">Account Analyst</Badge>
      <Badge variant="secondary">Market Scanner</Badge>
      <Badge variant="secondary">Copywriter</Badge>
      <Badge variant="secondary">Evaluator (Reflexion)</Badge>
      <Badge variant="secondary">Budget Optimizer</Badge>
      <Badge variant="secondary">Strategy Reporter</Badge>
    </div>
  ),
};
