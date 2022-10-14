import { FC } from 'react';

export interface TreeProps {
  test: boolean
}

export const Tree: FC<TreeProps> = () => {

  return (
    <p>Tree!</p>
  );
};