import { Meta, Story } from '@storybook/react';
import { Action, ActionMenu, ActionMenuProps } from '.';
import { createRef, useEffect, useState } from 'react';
import { styled } from '../../../styled';
import { useOutsideAlerter } from '../../../hooks';
import { useFloating } from '@floating-ui/react-dom';

export default {
  title: 'Other/ActionMenu',
  component: ActionMenu
} as Meta;

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

export const Default: Story<ActionMenuProps> = () => {
  const [visible, setVisible] = useState(false);
  const { x, y, reference, floating, strategy } = useFloating();
  const [selected, setSelected] = useState<number>(0);

  const parentRef = createRef<HTMLDivElement>();
  useOutsideAlerter(parentRef, () => {
    setVisible(false);
  });

  useEffect(() => {
    setVisible(false);
  }, [selected]);

  return (
    <>
      If you click outside of the gray parent component the popup will be closed.
      The popup is positioned based on the reference element.
      <ParentContainer ref={parentRef}>
        <Reference onClick={() => setVisible(true)} ref={reference}>
          reference element
        </Reference>
        {visible && (
          <ActionMenu
            selectedState={[selected, setSelected]}
            attributes={{ x, y, strategy }}
            ref={floating}
          >
            <Action onClick={() => { console.log('action 1 fired'); }} text="action 1">action 1</Action>
            <Action onClick={() => { console.log('action 2 fired'); }} text="action 2">action 2</Action>
            <Action onClick={() => { console.log('action 3 fired'); }} text="action 3">action 3</Action>
            <Action onClick={() => { console.log('action 4 fired'); }} text="action 4">action 4</Action>
          </ActionMenu>
        )}
      </ParentContainer>
    </>
  );
};
