import Slider, { SliderTooltip } from 'rc-slider';
const { Handle } = Slider;

interface handleParams {
  className: string;
  prefixCls?: string;
  vertical?: boolean;
  offset: number;
  value: number;
  dragging?: boolean;
  disabled?: boolean;
  min?: number;
  max?: number;
  reverse?: boolean;
  index: number;
  tabIndex?: number;
  ariaLabel: string;
  ariaLabelledBy: string;
  ariaValueTextFormatter?: (value: number) => string;
  style?: React.CSSProperties;
  ref?: React.Ref<any>;
}

export const handle = ({ value, dragging, index, ...restProps }: handleParams) => {
  return (
    <SliderTooltip
      key={index}
      overlay={`${value}`}
      placement="top"
      prefixCls="rc-slider-tooltip"
      visible={dragging}
    >
      <Handle value={value} {...restProps} />
    </SliderTooltip>
  );
};
