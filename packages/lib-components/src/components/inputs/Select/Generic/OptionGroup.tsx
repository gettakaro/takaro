import { FC, PropsWithChildren } from 'react';

export interface OptionGroupProps extends PropsWithChildren {
  label?: string;
}

export const OptionGroup: FC<OptionGroupProps> = ({ children, label }) => {
  return (
    <li>
      {label} && <div>{label}</div>
      <ul>{children}</ul>
    </li>
  );
};
