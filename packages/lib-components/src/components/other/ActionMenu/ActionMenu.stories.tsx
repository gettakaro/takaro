import { Meta, StoryFn } from '@storybook/react';
import { ActionMenu, ActionMenuProps } from '.';
import { AiOutlineShopping as ShoppingCartIcon } from 'react-icons/ai';
import { createRef, useState } from 'react';
import { usePopper } from 'react-popper';
import { styled } from '../../../styled';
import { useOutsideAlerter } from '../../../hooks';

export default {
  title: 'Other/ActionMenu',
  component: ActionMenu
} as Meta<ActionMenuProps>;

const Reference = styled.div`
  width: 200px;
  margin: 0 auto;
  background-color: orange;
`;
const ParentContainer = styled.div`
  background-color: purple;
  width: 100%;
  height: 30vh;
`;

export const Default: StoryFn<ActionMenuProps> = () => {
  const [visible, setVisible] = useState(false);
  const [referenceElement, setReferenceElement] = useState(null);
  const [popperElement, setPopperElement] = useState(null);
  const { styles, attributes } = usePopper(referenceElement, popperElement);

  const parentRef = createRef<HTMLDivElement>();
  useOutsideAlerter(parentRef, () => {
    setVisible(false);
  });

  const actions = [
    {
      icon: <ShoppingCartIcon />,
      text: 'Add to cart',
      onClick: () => {
        /* placeholder 1 */
      }
    },
    {
      icon: <ShoppingCartIcon />,
      text: 'Add to cart',
      onClick: () => {
        /* placeholder 2 */
      }
    }
  ];

  return (
    <>
      If you click outside of the purple parent component the popper will be closed.
      <ParentContainer ref={parentRef}>
        <Reference onClick={() => setVisible(true)} ref={setReferenceElement}>
          reference element
        </Reference>
        {visible && (
          <ActionMenu
            actions={actions}
            popperAttributes={attributes}
            popperStyles={styles}
            ref={setPopperElement}
            title="Action menu"
          />
        )}
      </ParentContainer>
    </>
  );
};
