import { DateTime } from 'luxon';
import { createContext, Dispatch, useContext } from 'react';

export interface DatePickerState {
  start: DateTime;
  end: DateTime;
  showQuickSelect: boolean;
  showBeginDate: boolean;
  showEndDate: boolean;
}

export type Action =
  | { type: 'toggle_quick_select_popover'; payload: { toggleQuickSelect: boolean } }
  | { type: 'toggle_begin_date_popover'; payload: { toggleBeginDate: boolean } }
  | { type: 'toggle_end_date_popover'; payload: { toggleEndDate: boolean } }
  | { type: 'set_start_date'; payload: { startDate: DateTime } }
  | { type: 'set_end_date'; payload: { endDate: DateTime } };

export const DatePickerContext = createContext<DatePickerState | null>(null);
export const DatePickerDispatchContext = createContext<Dispatch<Action> | null>(null);

export function useDatePickerContext() {
  return useContext(DatePickerContext);
}

export function useDatePickerDispatchContext() {
  return useContext(DatePickerDispatchContext);
}
