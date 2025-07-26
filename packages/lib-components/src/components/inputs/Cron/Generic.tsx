import { FC, MouseEvent, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { UnControlledSelectField } from '../../../components/inputs';
import { GenericInputProps } from '../../../components/inputs/InputProps';
import { Popover } from '../../../components/feedback';
import { ButtonContainer, ContentContainer, InnerContentContainer, ResultContainer } from './style';
import { Button, IconButton } from '../../../components/actions';
import { Placement } from '@floating-ui/react';
import { getCronStringFromValues, parseCronString, PeriodType } from './converter';
import { AiOutlineClose as ClearIcon } from 'react-icons/ai';

export interface CronProps {
  canClear?: boolean;
  popOverPlacement?: Placement;
}

export type GenericCronProps = GenericInputProps<string, HTMLInputElement> & CronProps;

export const GenericCron: FC<GenericCronProps> = ({
  value,
  id,
  readOnly = false,
  hasError,
  onChange,
  name,
  canClear,
  onFocus,
  onBlur,
  popOverPlacement,
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('month');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [selectedWeekdays, setSelectedWeekdays] = useState<string[]>([]);
  const [selectedHours, setSelectedHours] = useState<string[]>([]);
  const [selectedMinutes, setSelectedMinutes] = useState<string[]>([]);

  // Initialize state from value prop
  useEffect(() => {
    if (value) {
      try {
        const { period, months, monthDays, weekDays, hours, minutes } = parseCronString(value);
        setSelectedPeriod(period);
        setSelectedMonths(months);
        setSelectedDays(monthDays);
        setSelectedWeekdays(weekDays);
        setSelectedHours(hours);
        setSelectedMinutes(minutes);
      } catch (error) {
        console.error('Invalid cron string:', error);
        // Reset to defaults on invalid cron string
        setSelectedPeriod('month');
        setSelectedMonths([]);
        setSelectedDays([]);
        setSelectedWeekdays([]);
        setSelectedHours([]);
        setSelectedMinutes([]);
      }
    }
  }, [value]);

  const handleOnChange = () => {
    const cronString = getCronStringFromValues(
      selectedPeriod,
      selectedMonths,
      selectedDays,
      selectedWeekdays,
      selectedHours,
      selectedMinutes,
    );

    const event = {
      target: { value: cronString, name },
      preventDefault: () => {},
      stopPropagation: () => {},
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    onChange(event);
    setOpen(false);
  };

  const event = useMemo(() => {
    return {
      // value does not matter I think
      target: { value: '' },
      preventDefault: () => {},
      stopPropagation: () => {},
    } as unknown as React.FocusEvent<HTMLInputElement>;
  }, []);

  useLayoutEffect(() => {
    if (onFocus && onBlur) {
      if (open) {
        onFocus(event);
      } else {
        onBlur(event);
      }
    }
  }, [open]);

  const renderResult = () => {
    // When popover is closed, show the actual value prop
    // When popover is open, show preview of current selections
    if (!open && value) {
      return value;
    }

    const cronString = getCronStringFromValues(
      selectedPeriod,
      selectedMonths,
      selectedDays,
      selectedWeekdays,
      selectedHours,
      selectedMinutes,
    );
    return cronString;
  };

  const handleClear = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onChange) {
      onChange(null as any);
    }
  };

  return (
    <Popover placement={popOverPlacement}>
      <Popover.Trigger asChild>
        <ResultContainer readOnly={readOnly} hasError={hasError}>
          <span>{renderResult()}</span>
          {!readOnly && canClear && value && !open && (
            <IconButton size="tiny" icon={<ClearIcon />} ariaLabel="clear" onClick={handleClear} />
          )}
        </ResultContainer>
      </Popover.Trigger>
      <Popover.Content>
        <ContentContainer>
          <InnerContentContainer>
            <span>Every</span>
            <UnControlledSelectField
              value={selectedPeriod}
              onChange={(value) => setSelectedPeriod(value as PeriodType)}
              name="period"
              id={`period-${id}`}
              hasError={false}
              hasDescription={false}
              canClear={false}
              readOnly={readOnly}
              multiple={false}
              size="medium"
              enableFilter={false}
              render={(selectedItem) => {
                if (selectedItem.length === 0) {
                  return 'should not be empty';
                }
                return selectedItem[0].label;
              }}
            >
              <UnControlledSelectField.OptionGroup>
                <UnControlledSelectField.Option value="year" label="Year">
                  Year
                </UnControlledSelectField.Option>
                <UnControlledSelectField.Option value="month" label="Month">
                  Month
                </UnControlledSelectField.Option>
                <UnControlledSelectField.Option value="week" label="Week">
                  Week
                </UnControlledSelectField.Option>
                <UnControlledSelectField.Option value="day" label="Day">
                  Day
                </UnControlledSelectField.Option>
                <UnControlledSelectField.Option value="hour" label="Hour">
                  Hour
                </UnControlledSelectField.Option>
                <UnControlledSelectField.Option value="minute" label="Minute">
                  Minute
                </UnControlledSelectField.Option>
              </UnControlledSelectField.OptionGroup>
            </UnControlledSelectField>

            {selectedPeriod === 'year' && (
              <>
                <span>in</span>
                <UnControlledSelectField
                  value={selectedMonths}
                  onChange={(value) => setSelectedMonths(value)}
                  name="months"
                  id={`months-${id}`}
                  hasError={false}
                  hasDescription={false}
                  canClear={false}
                  readOnly={readOnly}
                  multiple={true}
                  size="medium"
                  enableFilter={false}
                  render={(selectedItems) => {
                    if (selectedItems.length === 0) {
                      return 'Every month';
                    }
                    return selectedItems.map((item) => item.label).join(', ');
                  }}
                >
                  <UnControlledSelectField.OptionGroup>
                    <UnControlledSelectField.Option value="1" label="January">
                      January
                    </UnControlledSelectField.Option>
                    <UnControlledSelectField.Option value="2" label="February">
                      February
                    </UnControlledSelectField.Option>
                    <UnControlledSelectField.Option value="3" label="March">
                      March
                    </UnControlledSelectField.Option>
                    <UnControlledSelectField.Option value="4" label="April">
                      April
                    </UnControlledSelectField.Option>
                    <UnControlledSelectField.Option value="5" label="May">
                      May
                    </UnControlledSelectField.Option>
                    <UnControlledSelectField.Option value="6" label="June">
                      June
                    </UnControlledSelectField.Option>
                    <UnControlledSelectField.Option value="7" label="July">
                      July
                    </UnControlledSelectField.Option>
                    <UnControlledSelectField.Option value="8" label="August">
                      August
                    </UnControlledSelectField.Option>
                    <UnControlledSelectField.Option value="9" label="September">
                      September
                    </UnControlledSelectField.Option>
                    <UnControlledSelectField.Option value="10" label="October">
                      October
                    </UnControlledSelectField.Option>
                    <UnControlledSelectField.Option value="11" label="November">
                      November
                    </UnControlledSelectField.Option>
                    <UnControlledSelectField.Option value="12" label="December">
                      December
                    </UnControlledSelectField.Option>
                  </UnControlledSelectField.OptionGroup>
                </UnControlledSelectField>
              </>
            )}

            {(selectedPeriod === 'year' || selectedPeriod === 'month') && (
              <>
                <span>on</span>
                <UnControlledSelectField
                  value={selectedDays}
                  onChange={(value) => setSelectedDays(value)}
                  name="days"
                  id={`days-${id}`}
                  hasError={false}
                  hasDescription={false}
                  canClear={false}
                  readOnly={readOnly}
                  multiple={true}
                  size="medium"
                  enableFilter={false}
                  render={(selectedItems) => {
                    if (selectedItems.length === 0) {
                      return 'Every day of the month';
                    }
                    return selectedItems.map((item) => item.label).join(', ');
                  }}
                >
                  <UnControlledSelectField.OptionGroup>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <UnControlledSelectField.Option key={day} value={day.toString()} label={day.toString()}>
                        {day.toString()}
                      </UnControlledSelectField.Option>
                    ))}
                  </UnControlledSelectField.OptionGroup>
                </UnControlledSelectField>
              </>
            )}

            {(selectedPeriod === 'year' || selectedPeriod === 'month') && <span>and</span>}
            {selectedPeriod === 'week' && <span>on</span>}
            {(selectedPeriod === 'year' || selectedPeriod === 'month' || selectedPeriod === 'week') && (
              <>
                <UnControlledSelectField
                  value={selectedWeekdays}
                  onChange={(value) => setSelectedWeekdays(value)}
                  name="weekdays"
                  id={`weekdays-${id}`}
                  hasError={false}
                  hasDescription={false}
                  canClear={false}
                  readOnly={readOnly}
                  multiple={true}
                  size="medium"
                  enableFilter={false}
                  render={(selectedItems) => {
                    if (selectedItems.length === 0) {
                      return 'Every day of the week';
                    }
                    return selectedItems.map((item) => item.label).join(', ');
                  }}
                >
                  <UnControlledSelectField.OptionGroup>
                    <UnControlledSelectField.Option value="1" label="Monday">
                      Monday
                    </UnControlledSelectField.Option>
                    <UnControlledSelectField.Option value="2" label="Tuesday">
                      Tuesday
                    </UnControlledSelectField.Option>
                    <UnControlledSelectField.Option value="3" label="Wednesday">
                      Wednesday
                    </UnControlledSelectField.Option>
                    <UnControlledSelectField.Option value="4" label="Thursday">
                      Thursday
                    </UnControlledSelectField.Option>
                    <UnControlledSelectField.Option value="5" label="Friday">
                      Friday
                    </UnControlledSelectField.Option>
                    <UnControlledSelectField.Option value="6" label="Saturday">
                      Saturday
                    </UnControlledSelectField.Option>
                    <UnControlledSelectField.Option value="7" label="Sunday">
                      Sunday
                    </UnControlledSelectField.Option>
                  </UnControlledSelectField.OptionGroup>
                </UnControlledSelectField>
              </>
            )}

            {(selectedPeriod === 'year' ||
              selectedPeriod === 'month' ||
              selectedPeriod === 'week' ||
              selectedPeriod === 'day') && (
              <>
                <span>At</span>
                <UnControlledSelectField
                  value={selectedHours}
                  onChange={(value) => setSelectedHours(value)}
                  name="hours"
                  id={`hours-${id}`}
                  hasError={false}
                  hasDescription={false}
                  canClear={false}
                  readOnly={readOnly}
                  multiple={true}
                  size="medium"
                  enableFilter={false}
                  render={(selectedItems) => {
                    if (selectedItems.length === 0) {
                      return 'Every hour';
                    }
                    return selectedItems.map((item) => item.label).join(', ');
                  }}
                >
                  <UnControlledSelectField.OptionGroup>
                    {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                      <UnControlledSelectField.Option
                        key={hour}
                        value={hour.toString()}
                        label={hour.toString().padStart(2, '0')}
                      >
                        {hour.toString().padStart(2, '0')}
                      </UnControlledSelectField.Option>
                    ))}
                  </UnControlledSelectField.OptionGroup>
                </UnControlledSelectField>
              </>
            )}

            {selectedPeriod !== 'minute' && selectedPeriod !== 'hour' && <span>:</span>}
            {selectedPeriod === 'hour' && <span>at</span>}

            {selectedPeriod !== 'minute' && (
              <UnControlledSelectField
                id={`minutes-${id}`}
                name="minutes"
                value={selectedMinutes}
                canClear={canClear}
                hasError={false}
                hasDescription={false}
                onChange={setSelectedMinutes}
                readOnly={readOnly}
                multiple={true}
                size="medium"
                enableFilter={false}
                render={(selectedItems) => {
                  if (selectedItems.length === 0) {
                    return 'Every minute';
                  }
                  return selectedItems.map((item) => item.label).join(', ');
                }}
              >
                <UnControlledSelectField.OptionGroup>
                  {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
                    <UnControlledSelectField.Option
                      key={minute}
                      value={minute.toString()}
                      label={minute.toString().padStart(2, '0')}
                    >
                      {minute.toString().padStart(2, '0')}
                    </UnControlledSelectField.Option>
                  ))}
                </UnControlledSelectField.OptionGroup>
              </UnControlledSelectField>
            )}
          </InnerContentContainer>
          <ButtonContainer>
            <Button onClick={() => setOpen(false)} fullWidth color="secondary" text="Cancel" />
            <Button onClick={handleOnChange} fullWidth text="Select" />
          </ButtonContainer>
        </ContentContainer>
      </Popover.Content>
    </Popover>
  );
};
