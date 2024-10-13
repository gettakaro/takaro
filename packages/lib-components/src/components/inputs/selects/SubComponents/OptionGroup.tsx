import { FC, PropsWithChildren, JSX } from 'react';

export interface OptionGroupProps extends PropsWithChildren {
  label?: string;
  icon?: JSX.Element;
}

export const OptionGroup: FC<OptionGroupProps> = ({ children, label }) => {
  {
    /* This is actually never rendered, the optiongroup is build in the select fields themself*/
  }
  return (
    <li>
      {label && <div>{label}</div>}
      <ul>{children}</ul>
    </li>
  );
};
