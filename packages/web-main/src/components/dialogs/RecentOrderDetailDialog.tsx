import { FC } from 'react';
import { Avatar, Chip, CopyId, Dialog, styled, formatCurrency } from '@takaro/lib-components';
import { RequiredDialogOptions } from '.';
import { RecentOrderDTO, RecentOrderDTOStatusEnum } from '@takaro/apiclient';
import { AiOutlineUser as UserIcon } from 'react-icons/ai';
import { DateTime } from 'luxon';
import { ChipColor } from '@takaro/lib-components/src/components/data/Chip';

interface RecentOrderDetailDialogProps extends RequiredDialogOptions {
  order: RecentOrderDTO;
}

const OrderDetailsGrid = styled.div`
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: ${({ theme }) => theme.spacing[4]};
  align-items: start;
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const DetailLabel = styled.div`
  font-size: ${({ theme }) => theme.fontSize.tiny};
  color: ${({ theme }) => theme.colors.textAlt};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const DetailValue = styled.div`
  font-size: ${({ theme }) => theme.fontSize.medium};
  color: ${({ theme }) => theme.colors.text};
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const ValueAmount = styled(DetailValue)`
  font-size: ${({ theme }) => theme.fontSize.large};
  font-weight: bold;
  color: ${({ theme }) => theme.colors.success};
`;

export const RecentOrderStatusColorMap: Record<RecentOrderDTOStatusEnum, ChipColor> = {
  [RecentOrderDTOStatusEnum.Completed]: 'success',
  [RecentOrderDTOStatusEnum.Canceled]: 'error',
  [RecentOrderDTOStatusEnum.Paid]: 'warning',
};

export const RecentOrderDetailDialog: FC<RecentOrderDetailDialogProps> = ({ order, ...dialogOptions }) => {
  return (
    <Dialog {...dialogOptions}>
      <Dialog.Content>
        <Dialog.Heading>Order Details</Dialog.Heading>
        <Dialog.Body>
          <OrderDetailsGrid>
            <DetailItem>
              <DetailLabel>Customer</DetailLabel>
              <DetailValue>
                <Avatar size="tiny">
                  <UserIcon />
                </Avatar>
                {order.playerName}
              </DetailValue>
            </DetailItem>

            <DetailItem>
              <DetailLabel>Status</DetailLabel>
              <Chip color={RecentOrderStatusColorMap[order.status]} label={order.status} variant="outline" />
            </DetailItem>

            <DetailItem>
              <DetailLabel>Item</DetailLabel>
              <DetailValue>{order.itemName}</DetailValue>
            </DetailItem>

            <DetailItem>
              <DetailLabel>Value</DetailLabel>
              <ValueAmount>{formatCurrency(order.value, 2)}</ValueAmount>
            </DetailItem>

            <DetailItem>
              <DetailLabel>Order Time</DetailLabel>
              <DetailValue>
                {DateTime.fromISO(order.time || DateTime.now().toISO()).toLocaleString(DateTime.DATETIME_MED)}
              </DetailValue>
            </DetailItem>

            <DetailItem>
              <DetailLabel>Order ID</DetailLabel>
              <DetailValue>
                <CopyId copyText={order.id} id={order.id} />
              </DetailValue>
            </DetailItem>
          </OrderDetailsGrid>
        </Dialog.Body>
      </Dialog.Content>
    </Dialog>
  );
};
