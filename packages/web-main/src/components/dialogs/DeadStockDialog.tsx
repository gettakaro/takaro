import { Dialog, styled } from '@takaro/lib-components';
import { RequiredDialogOptions } from '.';
import { FC } from 'react';
import { DeadStockItemDTO } from '@takaro/apiclient';

interface DeadStockDialogProps extends RequiredDialogOptions {
  // A list of dead stock items (potentially incomplete)
  deadStockItems: DeadStockItemDTO[];
  totalDeadStock: number;
}

const DeadStockList = styled.div`
  max-height: 400px;
  overflow-y: auto;
`;

const DeadStockItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing[2]};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  margin-bottom: ${({ theme }) => theme.spacing[1]};
`;

const DeadStockItemInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing['0_5']};
`;

const DeadStockItemName = styled.span`
  font-size: ${({ theme }) => theme.fontSize.medium};
  font-weight: 500;
`;

const DeadStockItemDays = styled.span`
  font-size: ${({ theme }) => theme.fontSize.tiny};
  color: ${({ theme }) => theme.colors.textAlt};
`;

export const DeadStockDialog: FC<DeadStockDialogProps> = ({ totalDeadStock, deadStockItems, ...dialogOptions }) => {
  return (
    <Dialog {...dialogOptions}>
      <Dialog.Content>
        <Dialog.Heading>Products with No Sales</Dialog.Heading>
        <Dialog.Body>
          <div style={{ marginBottom: '16px', color: '#9ca3af', fontSize: '14px' }}>
            These products have not sold in the selected period:
          </div>
          <DeadStockList>
            {deadStockItems.map((item) => (
              <DeadStockItem key={item.id}>
                <DeadStockItemInfo>
                  <DeadStockItemName>{item.name}</DeadStockItemName>
                  <DeadStockItemDays>Created {item.daysSinceCreated} days ago</DeadStockItemDays>
                </DeadStockItemInfo>
              </DeadStockItem>
            ))}
          </DeadStockList>
          <div style={{ marginTop: '16px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
            Showing {deadStockItems.length} of {totalDeadStock} items with no sales
          </div>
        </Dialog.Body>
      </Dialog.Content>
    </Dialog>
  );
};
