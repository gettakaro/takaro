import { DateTime } from 'luxon';
import { createContext, Dispatch, useContext } from 'react';
import { Tense, Unit } from './QuickSelect';

export interface DateRangePickerState {
  start: DateTime;
  end: DateTime;
  quickSelect: {
    show: boolean;
    tense: Tense;
    step: number;
    unit: Unit;
  };
  showStartDate: boolean;
  showEndDate: boolean;
  friendlyStartDate?: string;
  friendlyEndDate?: string;
  friendlyRange?: string;
  disabledOrReadOnly: boolean;
}

export function reducer(state: DateRangePickerState, action: Action): DateRangePickerState {
  if (state.disabledOrReadOnly && action.type !== 'toggle_disable_or_readonly') {
    return state;
  }

  switch (action.type) {
    case 'toggle_disable_or_readonly':
      return {
        ...state,
        disabledOrReadOnly: action.payload.disabledOrReadOnly,
      };
    case 'toggle_quick_select_popover':
      return {
        ...state,
        quickSelect: { ...state.quickSelect, show: action.payload.toggleQuickSelect },
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
        // If endDate is before new startDate, set endDate to new startDate
        end: state.end < action.payload.startDate ? action.payload.startDate : state.end,
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

    case 'set_quick_select':
      return {
        ...state,
        quickSelect: { ...state.quickSelect, ...action.payload.quickSelect },
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
        quickSelect: { ...state.quickSelect, show: false },
      };
  }
}

export type Action =
  | { type: 'toggle_quick_select_popover'; payload: { toggleQuickSelect: boolean } }
  | { type: 'toggle_start_date_popover'; payload: { toggleStartDate: boolean } }
  | { type: 'toggle_end_date_popover'; payload: { toggleEndDate: boolean } }
  | { type: 'set_quick_select'; payload: { quickSelect: DateRangePickerState['quickSelect'] } }
  | { type: 'set_relative_start_date'; payload: { startDate: DateTime; friendlyStartDate?: string } }
  | { type: 'set_absolute_start_date'; payload: { startDate: DateTime } }
  | { type: 'set_relative_end_date'; payload: { endDate: DateTime; friendlyEndDate?: string } }
  | { type: 'set_absolute_end_date'; payload: { endDate: DateTime } }
  | { type: 'set_range'; payload: { startDate: DateTime; endDate: DateTime; friendlyRange?: string } }
  | { type: 'toggle_disable_or_readonly'; payload: { disabledOrReadOnly: boolean } };

export const DateRangePickerContext = createContext<DateRangePickerState | null>(null);
export const DateRangePickerDispatchContext = createContext<Dispatch<Action> | null>(null);

export function useDateRangePickerContext() {
  return useContext(DateRangePickerContext);
}

export function useDateRangePickerDispatchContext() {
  return useContext(DateRangePickerDispatchContext);
}
