import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components';
import { styled } from '../../../styled';

const Wrapper = styled.div`
  border: 2px solid ${({ theme }) => theme.colors.background};
  border-radius: .5rem;
  margin-top: 3rem;
`;

const Header = styled.div`
  display: flex;
  padding: 1.5rem;
`;

const DetailsContainer = styled.div`
  display: grid;
  width: 80%;
  grid-template-columns: 150px 150px 150px;
  
  .header {
    font-weight: 500;
    color: black;
    margin-bottom: .8rem;
  }
  .total {
    color: black;
  }

  div {
    color: ${({ theme }) => theme.colors.lightGray};
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  width: 20%;

  button:first-child {
    margin-right: 1rem;
  }
`;

export interface OrderProps {
  orderId: string;
  date: string,
  invoiceUrl: string,
  items: ItemProps[]
}

export const Order: FC<OrderProps> = ({ orderId, date, items, invoiceUrl }) => {
  let sum = 0;
  items.forEach((it) => sum += it.price);
  const navigate = useNavigate();

  return (
    <Wrapper>
      <Header>
        <DetailsContainer>
          <div className="header">Order number</div>
          <div className="header">Date placed</div>
          <div className="header">Total amount</div>
          <div>{orderId}</div>
          <div>{date}</div>
          <div className="total">€{(Math.round(sum * 100) / 100).toFixed(2)}</div>
        </DetailsContainer>
        <ButtonContainer>
          <Button color="secondary" variant="outline" size="small" onClick={() => {/**/ }} text="View Order" />
          <Button color="secondary" variant="outline" size="small" onClick={() => { navigate(invoiceUrl); }} text="View Invoice" />
        </ButtonContainer>
      </Header>
      {
        items.map((it: ItemProps) => (
          <Item {...it} />
        ))
      }
    </Wrapper>
  );
};

interface ItemProps {
  id: string;
  name: string;
  description: string;
  price: number;
}

const ItemContainer = styled.div`
  border-top: 2px solid ${({ theme }) => theme.colors.background};
  padding: 1.5rem;

  
  .c {
    display: flex;
    justify-content: space-between;
    h4, span {
    color: black;
    font-weight: 500;
    }
  }

  p {
    color: ${({ theme }) => theme.colors.lightGray};
  }
`;

const Item: FC<ItemProps> = ({ name, description, price }) => {
  return (
    <ItemContainer>
      <div className="c"><h4>{name}</h4> <span>€{(Math.round(price * 100) / 100).toFixed(2)}</span></div>
      <p>{description}</p>
    </ItemContainer>
  );
};

