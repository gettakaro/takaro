import { CellProps } from '@jsonforms/core';
import { withJsonFormsCellProps } from '@jsonforms/react';
import { GenericTextField } from '../../../TextField';

export const TextFieldCell = withJsonFormsCellProps(
  ({ enabled, handleChange, path, errors, id }: CellProps) => {
    return (
      <GenericTextField
        onChange={(val: any) => {
          console.log(val, path);
          handleChange(path, val);
        }}
        name={id}
        disabled={!enabled}
        errorMessage={errors}
        loading={false}
      />
    );
  }
);
