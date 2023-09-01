import { DateTime } from 'luxon';
import { createContext, Dispatch, useContext } from 'react';

export interface DatePickerState {
  start: DateTime;
  end: DateTime;
  showQuickSelect: boolean;
  showStartDate: boolean;
  showEndDate: boolean;
  friendlyStartDate?: string;
  friendlyEndDate?: string;
  friendlyRange?: string;
}

export function reducer(state: DatePickerState, action: Action): DatePickerState {
  switch (action.type) {
    case 'toggle_quick_select_popover':
      return {
        ...state,
        showQuickSelect: action.payload.toggleQuickSelect,
      };
    case 'toggle_start_date_popover':
      return {
        ...state,
        friendlyRange: undefined,
        showStartDate: action.payload.toggleStartDate,
      };
    case 'toggle_end_date_popover':
      return {
        ...state,
        friendlyRange: undefined,
        showEndDate: action.payload.toggleEndDate,
      };

    case 'set_absolute_start_date':
      return {
        ...state,
        start: action.payload.startDate,
        friendlyStartDate: undefined,
        friendlyRange: undefined,
      };
    case 'set_relative_start_date':
      return {
        ...state,
        start: action.payload.startDate,
        friendlyStartDate: action.payload.friendlyStartDate,
        friendlyRange: undefined,
      };

    case 'set_absolute_end_date':
      return {
        ...state,
        end: action.payload.endDate,
        friendlyEndDate: undefined,
        friendlyRange: undefined,
      };

    case 'set_relative_end_date':
      return {
        ...state,
        end: action.payload.endDate,
        friendlyEndDate: action.payload.friendlyEndDate,
        friendlyRange: undefined,
      };
    case 'set_range':
      return {
        ...state,
        end: action.payload.endDate,
        start: action.payload.startDate,
        friendlyRange: action.payload.friendlyRange,
        friendlyEndDate: undefined,
        friendlyStartDate: undefined,
      };
  }
}

export type Action =
  | { type: 'toggle_quick_select_popover'; payload: { toggleQuickSelect: boolean } }
  | { type: 'toggle_start_date_popover'; payload: { toggleStartDate: boolean } }
  | { type: 'toggle_end_date_popover'; payload: { toggleEndDate: boolean } }
  | { type: 'set_relative_start_date'; payload: { startDate: DateTime; friendlyStartDate?: string } }
  | { type: 'set_absolute_start_date'; payload: { startDate: DateTime } }
  | { type: 'set_relative_end_date'; payload: { endDate: DateTime; friendlyEndDate?: string } }
  | { type: 'set_absolute_end_date'; payload: { endDate: DateTime } }
  | { type: 'set_range'; payload: { startDate: DateTime; endDate: DateTime; friendlyRange?: string } };

export const DatePickerContext = createContext<DatePickerState | null>(null);
export const DatePickerDispatchContext = createContext<Dispatch<Action> | null>(null);

export function useDatePickerContext() {
  return useContext(DatePickerContext);
}

export function useDatePickerDispatchContext() {
  return useContext(DatePickerDispatchContext);
}
