import { EnterpriseIcon as EnterpriseIconBase, type IconProps } from "@eaip/icons";

export interface EnterpriseIconProps extends Omit<IconProps, "name"> {
  name?: string;
}

export function EnterpriseIcon({ name = "circle", ...props }: EnterpriseIconProps) {
  return <EnterpriseIconBase name={name as IconProps["name"]} {...props} />;
}
