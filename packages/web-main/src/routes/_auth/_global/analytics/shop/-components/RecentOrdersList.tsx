import { RecentOrderDTO } from '@takaro/apiclient';
import { Card, Chip, IconTooltip, styled, formatNumber, CopyId } from '@takaro/lib-components';
import { RecentOrderStatusColorMap } from '../../../../../../components/dialogs/RecentOrderDetailDialog';
import { DateTime } from 'luxon';
import { FC } from 'react';
import { AiOutlineClockCircle as ClockIcon, AiOutlineInfoCircle as InfoIcon } from 'react-icons/ai';

const StyledCard = styled(Card)`
  display: flex;
  flex-direction: column;
  height: 456px;
`;

const StyledCardBody = styled(Card.Body)`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
`;

const OrdersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing['1']};
  overflow-y: auto;
  flex: 1;
  max-height: 380px;
`;

const OrderItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing['0_5']};
  padding: ${({ theme }) => theme.spacing['1']};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: 1px solid ${({ theme }) => theme.colors.backgroundAccent};
`;

const OrderItemRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const OrderInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  font-size: ${({ theme }) => theme.fontSize.medium};
  font-weight: 500;
`;

const OrderSeparator = styled.span`
  color: ${({ theme }) => theme.colors.textAlt};
`;

const OrderItemName = styled.span`
  color: ${({ theme }) => theme.colors.textAlt};
  font-weight: 400;
`;

const OrderValue = styled.div`
  font-size: ${({ theme }) => theme.fontSize.mediumLarge};
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
`;

const OrderMeta = styled.span`
  font-size: ${({ theme }) => theme.fontSize.tiny};
  color: ${({ theme }) => theme.colors.textAlt};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['0_25']};
`;

interface RecentOrdersListProps {
  orders: RecentOrderDTO[];
}

export const RecentOrdersList: FC<RecentOrdersListProps> = ({ orders }) => {
  return (
    <>
      <StyledCard>
        <Card.Title label="10 Most Recent Orders">
          <IconTooltip icon={<InfoIcon />} size="small" color="white">
            Latest 10 orders showing player, item, value and time. Helps monitor real-time shop activity and quickly
            identify any issues with orders or popular items.
          </IconTooltip>
        </Card.Title>
        <StyledCardBody>
          <OrdersList>
            {orders.length > 0 ? (
              orders.map((order) => (
                <OrderItem key={order.id}>
                  <OrderItemRow>
                    <OrderInfo>
                      {/* TODO: replace this with PlayerLink */}
                      <span>{order.playerName}</span>
                      <OrderSeparator>·</OrderSeparator>
                      <OrderItemName>{order.itemName}</OrderItemName>
                    </OrderInfo>
                    <OrderValue>{formatNumber(order.value)}</OrderValue>
                  </OrderItemRow>
                  <OrderItemRow>
                    <OrderMeta>
                      <ClockIcon size={12} />
                      {DateTime.fromISO(order.time || DateTime.now().toISO()).toRelative()}
                      <div style={{ marginLeft: '10px' }} />
                      <CopyId id={order.id} placeholder="Order Id" />
                    </OrderMeta>
                    <Chip label={order.status} color={RecentOrderStatusColorMap[order.status]} />
                  </OrderItemRow>
                </OrderItem>
              ))
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <p>No recent orders</p>
              </div>
            )}
          </OrdersList>
        </StyledCardBody>
      </StyledCard>
    </>
  );
};

/*
 *
 *
 const TopBuyersContainer = styled.div`
  margin-top: auto;
  padding: ${({ theme }) => theme.spacing[2]};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
`;

const TopBuyersHeader = styled.div`
  font-size: ${({ theme }) => theme.fontSize.tiny};
  font-weight: bold;
  margin-bottom: ${({ theme }) => theme.spacing[1]};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['0_5']};
  color: ${({ theme }) => theme.colors.text};
`;

const TopBuyerItem = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: ${({ theme }) => theme.fontSize.tiny};
  margin-bottom: ${({ theme }) => theme.spacing['0_5']};
`;

const TopBuyerRank = styled.span`
  color: ${({ theme }) => theme.colors.text};
`;

const TopBuyerAmount = styled.span`
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
`;
 {customers?.topBuyers && customers.topBuyers.length > 0 && !isLoading && (
              <TopBuyersContainer>
                <TopBuyersHeader>
                  Top Buyers
                  <IconTooltip icon={<InfoIcon />} size="tiny" color="background">
                    Players ranked by total amount spent. Includes order count and last purchase date to identify your
                    most valuable customers and target them with special offers.
                  </IconTooltip>
                </TopBuyersHeader>
                {customers.topBuyers.slice(0, 3).map((buyer, index) => (
                  <TopBuyerItem key={buyer.id}>
                    <TopBuyerRank>
                      {index + 1}. {buyer.name}
                    </TopBuyerRank>
                    <TopBuyerAmount>{buyer.totalSpent.toFixed(0)}</TopBuyerAmount>
                  </TopBuyerItem>
                ))}
              </TopBuyersContainer>

 */
