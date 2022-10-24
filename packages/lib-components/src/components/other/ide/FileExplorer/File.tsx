import { FC, MouseEvent } from 'react';
import { styled } from '../../../../styled';
import {
  AiFillFolder as DirClosedIcon,
  AiFillFolderOpen as DirOpenIcon,
  AiFillFile as FileIcon,
} from 'react-icons/ai';

const Button = styled.button<{ isActive: boolean; depth: number }>`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0;
  background-color: transparent;
  border-radius: none;
  padding: 0 1rem;
  margin-left: ${({ depth }) => `${depth * 2}rem`};

  span {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    color: ${({ isActive, theme }) =>
      isActive ? theme.colors.primary : 'black'};
  }
  svg {
    margin-right: 1rem;
  }
`;

export interface FileProps {
  path: string;
  selectFile?: (path: string) => void;
  active?: boolean;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  depth: number;
  isDirOpen?: boolean;
}

export const File: FC<FileProps> = ({
  path,
  selectFile,
  isDirOpen,
  active,
  onClick,
  depth,
}) => {
  const fileName = path.split('/').filter(Boolean).pop();

  const onClickButton = (event: React.MouseEvent<HTMLButtonElement>): void => {
    if (selectFile) {
      selectFile(path);
    }
    onClick?.(event);
  };

  const getIcon = (): JSX.Element => {
    if (selectFile) return <FileIcon size={20} />;

    return isDirOpen ? <DirOpenIcon size={20} /> : <DirClosedIcon size={20} />;
  };

  return (
    <Button
      isActive={active ? true : false}
      depth={depth}
      title={fileName}
      onClick={onClickButton}
      type="button"
    >
      {getIcon()}
      <span>{fileName}</span>
    </Button>
  );
};
