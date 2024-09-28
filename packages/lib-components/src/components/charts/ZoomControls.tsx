import { ProvidedZoom } from '@visx/zoom/lib/types';
import { FC } from 'react';
import { styled } from '../../styled';
import { Button, IconButton, Tooltip } from '../../components';
import { AiOutlinePlus as ZoomInIcon, AiOutlineMinus as ZoomOutIcon } from 'react-icons/ai';

const Controls = styled.div`
  position: absolute;
  bottom: 2rem;
  right: 3rem;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

interface ZoomControlsProps {
  zoom: ProvidedZoom<SVGSVGElement>;
}

export const ZoomControls: FC<ZoomControlsProps> = ({ zoom }) => {
  return (
    <Controls>
      <Tooltip placement="left">
        <Tooltip.Trigger asChild>
          <IconButton
            icon={<ZoomInIcon />}
            ariaLabel="zoom in"
            onClick={() => zoom.scale({ scaleX: 1.2, scaleY: 1.2 })}
          />
        </Tooltip.Trigger>
        <Tooltip.Content>Zoom in</Tooltip.Content>
      </Tooltip>
      <Tooltip placement="left">
        <Tooltip.Trigger asChild>
          <IconButton
            icon={<ZoomOutIcon />}
            ariaLabel="zoom in"
            onClick={() => zoom.scale({ scaleX: 0.8, scaleY: 0.8 })}
          />
        </Tooltip.Trigger>
        <Tooltip.Content>Zoom out</Tooltip.Content>
      </Tooltip>
      <Button size="tiny" onClick={zoom.reset} text="Reset" />
      {/*<Button size="tiny" onClick={zoom.center} text="Center" />*/}
    </Controls>
  );
};
