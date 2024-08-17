import { FC, PropsWithChildren, JSX } from 'react';

export interface OptionGroupProps extends PropsWithChildren {
  label?: string;
  icon?: JSX.Element;
}

export const OptionGroup: FC<OptionGroupProps> = ({ children, label }) => {
  /* Currently this is actually never rendered. in Select.index.tsx the OptionGroup is built based on the props*/
  return (
    <li>
      {label} && <div>{label}</div>
      <ul>{children}</ul>
    </li>
  );
};
