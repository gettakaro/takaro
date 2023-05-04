import { GenericTextField } from '../../../TextField';
import { RankedTester, rankWith } from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';

interface TextFieldControlProps {
  data: any;
  handleChange(path: string, value: any): void;
  path: string;
  id: string;
}

export const TextFieldControl = withJsonFormsControlProps(
  (props: TextFieldControlProps) => {
    console.log(props);

    return (
      <GenericTextField
        onChange={(val: string) => {
          props.handleChange(props.path, val);
        }}
        loading={false}
        name={props.id}
        errorMessage=""
      />
    );
  }
);

export const textFieldControlTester: RankedTester = rankWith(3, () => true);
