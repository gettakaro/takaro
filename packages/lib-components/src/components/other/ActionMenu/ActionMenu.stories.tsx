import React, { useRef, useEffect, useState } from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { Action, ActionMenu, ActionMenuProps } from '.';
import { styled } from '../../../styled';
import { useOutsideAlerter } from '../../../hooks';
import { useFloating } from '@floating-ui/react';

export default {
  title: 'Other/ActionMenu',
  component: ActionMenu,
} as Meta<ActionMenuProps>;

const Reference = styled.div`
  width: 200px;
  margin: 0 auto;
  background-color: orange;
`;
const ParentContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  width: 50%;
  margin: 0 auto;
  height: 30vh;
`;

export const Default: StoryFn<ActionMenuProps> = () => {
  const [visible, setVisible] = useState(false);
  const { x, y, refs, strategy } = useFloating();
  const [selected, setSelected] = useState<number>(0);
  const parentRef = useRef<HTMLDivElement>(null);
  useOutsideAlerter(parentRef, () => {
    setVisible(false);
  });

  useEffect(() => {
    setVisible(false);
  }, [selected]);

  return (
    <>
      If you click outside of the gray parent component the popup will be closed. The popup is positioned based on the
      reference element.
      <ParentContainer ref={parentRef}>
        <Reference onClick={() => setVisible(true)} ref={refs.setReference}>
          reference element
        </Reference>
        {visible && (
          <ActionMenu selectedState={[selected, setSelected]} attributes={{ x, y, strategy }} ref={refs.setFloating}>
            <Action
              onClick={() => {
                console.log('action 1 fired');
              }}
            >
              action 1
            </Action>
            <Action
              onClick={() => {
                console.log('action 2 fired');
              }}
            >
              action 2
            </Action>
            <Action
              onClick={() => {
                console.log('action 3 fired');
              }}
            >
              action 3
            </Action>
            <Action
              onClick={() => {
                console.log('action 4 fired');
              }}
            >
              action 4
            </Action>
          </ActionMenu>
        )}
      </ParentContainer>
    </>
  );
};
