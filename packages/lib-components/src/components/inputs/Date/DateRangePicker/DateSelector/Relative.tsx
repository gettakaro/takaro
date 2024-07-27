import { FC } from 'react';
import { Divider } from '../../../../../components';
import { DateTime } from 'luxon';
import { useDateRangePickerContext, useDateRangePickerDispatchContext } from '../Context';
import { RelativePicker } from '../../subcomponents/RelativePicker';
import { GenericTextField } from '../../../TextField';

interface RelativeProps {
  isStart: boolean;
}

export const Relative: FC<RelativeProps> = ({ isStart }) => {
  const dispatch = useDateRangePickerDispatchContext();
  const state = useDateRangePickerContext();

  if (!dispatch || !state) {
    throw new Error(
      'useDateRangePickerDispatchContext and useDateRangePickerContext must be used within a DateRangePickerProvider',
    );
  }

  const handleOnChange = (selectedDate: DateTime, friendlyName?: string) => {
    if (selectedDate) {
      if (isStart)
        dispatch({
          type: 'set_relative_start_date',
          payload: { startDate: selectedDate, friendlyStartDate: friendlyName },
        });
      else
        dispatch({ type: 'set_relative_end_date', payload: { endDate: selectedDate, friendlyEndDate: friendlyName } });
    }
  };

  return (
    <>
      <RelativePicker id={`${isStart ? 'start' : 'end'}`} onChange={handleOnChange} />
      <Divider fullWidth />
      <GenericTextField
        hasDescription={false}
        hasError={false}
        name={`date-preview-${isStart}`}
        id={`date-preview-${isStart}`}
        onChange={() => {}}
        readOnly={true}
        prefix={isStart ? 'Start date' : 'End date'}
        value={
          isStart
            ? state.start.toFormat('LLL d, yyyy @ HH:mm:ss.SSS')
            : state.end.toFormat('LLL d, yyyy @ HH:mm:ss.SSS')
        }
      />
    </>
  );
};
