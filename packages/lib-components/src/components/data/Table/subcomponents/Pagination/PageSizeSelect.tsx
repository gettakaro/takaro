import { FC } from 'react';
import { UnControlledSelectField } from '../../../../../components';

interface PageSizeSelectProps {
  onPageSizeChange: (pageSize: string) => void;
  pageSize: string;
}

export const PageSizeSelect: FC<PageSizeSelectProps> = ({ onPageSizeChange, pageSize }) => {
  return (
    <UnControlledSelectField
      hasError={false}
      hasDescription={false}
      id="page-size"
      multiple={false}
      name="pageSize"
      inPortal={true}
      value={pageSize.toString() || '10'}
      onChange={onPageSizeChange}
      render={(selectedItems) => {
        if (selectedItems.length === 0) {
          return <div>Select...</div>;
        }
        return <div>{selectedItems[0].label} items</div>;
      }}
    >
      <UnControlledSelectField.OptionGroup label="Options">
        {[5, 10, 25, 50, 100, 200].map((val: number) => (
          <UnControlledSelectField.Option key={`${val}-table`} value={val.toString()} label={val.toString()}>
            <div>
              <span>{val} items</span>
            </div>
          </UnControlledSelectField.Option>
        ))}
      </UnControlledSelectField.OptionGroup>
    </UnControlledSelectField>
  );
};
