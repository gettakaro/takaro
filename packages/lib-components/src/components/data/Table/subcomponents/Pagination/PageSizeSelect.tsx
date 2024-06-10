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
        {[5, 10, 20, 30, 40, 50].map((val: number) => (
          <UnControlledSelectField.Option key={`${val}-table`} value={val.toString(10)} label={val.toString(10)}>
            <div>
              <span>{val} items</span>
            </div>
          </UnControlledSelectField.Option>
        ))}
      </UnControlledSelectField.OptionGroup>
    </UnControlledSelectField>
  );
};
