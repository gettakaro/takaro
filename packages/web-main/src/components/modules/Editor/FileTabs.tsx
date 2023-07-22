import { FC, useEffect, useState } from 'react';
import { useSandpack } from '@codesandbox/sandpack-react';
import { styled, Tooltip, useTheme } from '@takaro/lib-components';
import { calculateNearestUniquePath, getFileName } from './utils';
import { AiOutlineClose as CloseIcon } from 'react-icons/ai';
import { DiJsBadge as JsIcon } from 'react-icons/di';

const Tabs = styled.div`
  border-bottom: "1px solid ${({ theme }) => theme.colors.background};
  background: ${({ theme }) => theme.colors.background};
`;

const ScrollableContainer = styled.div`
  overflow: auto;
  display: flex;
  flex-wrap: nowrap;
  align-items: stretch;
  min-height: 40px;
`;

export const StyledCloseIcon = styled(CloseIcon)<{ isActive: boolean }>`
  margin-left: ${({ theme }) => theme.spacing['0_75']};
  cursor: pointer;
  visibility: ${({ isActive }) => (isActive ? 'visible' : 'hidden')};
`;

export const TabButton = styled.button<{ isActive: boolean }>`
  padding: ${({ theme }) => `0 ${theme.spacing[1]}`};
  white-space: nowrap;
  display: flex;
  align-items: center;
  border-radius: 0;
  background-color: ${({ theme }) => theme.colors.background};
  ${({ isActive, theme }) => isActive && `border-bottom: 1px solid ${theme.colors.primary};`};
  min-width: fit-content;
  width: 80px;
  font-size: ${({ theme }) => theme.fontSize.small};
  color: ${({ theme, isActive }) => (isActive ? theme.colors.white : theme.colors.text)};

  &:hover {
    ${StyledCloseIcon} {
      visibility: visible;
    }
  }
`;

export interface FileTabsProps {
  closableTabs?: boolean;
}

export const FileTabs: FC<FileTabsProps> = ({ closableTabs }) => {
  const { sandpack } = useSandpack();

  const theme = useTheme();

  const { activeFile, visibleFiles, setActiveFile } = sandpack;

  const getTriggerText = (currentPath: string): string => {
    const documentFileName = getFileName(currentPath);

    const pathsWithDuplicateFileNames = visibleFiles.reduce((prev, curr) => {
      if (curr === currentPath) {
        return prev;
      }

      const fileName = getFileName(curr);

      if (fileName === documentFileName) {
        prev.push(curr);
        return prev;
      }

      return prev;
    }, [] as string[]);

    if (pathsWithDuplicateFileNames.length === 0) {
      return documentFileName;
    } else {
      return calculateNearestUniquePath(currentPath, pathsWithDuplicateFileNames);
    }
  };

  return (
    <Tabs translate="no">
      <ScrollableContainer aria-label="Select active file" role="tablist">
        {visibleFiles.map((filePath) => (
          <TabButton
            key={filePath}
            aria-selected={filePath === activeFile}
            isActive={filePath === activeFile}
            onClick={(): void => setActiveFile(filePath)}
            role="tab"
            title={filePath}
            type="button"
          >
            <JsIcon size={11} style={{ marginRight: '5px', fill: theme.colors.secondary }} />
            {getTriggerText(filePath)}
            {closableTabs && visibleFiles.length > 1 && (
              <Tooltip>
                <Tooltip.Trigger asChild>
                  <StyledCloseIcon
                    isActive={filePath === activeFile}
                    onClick={(e) => {
                      e.stopPropagation();
                      sandpack.closeFile(filePath);
                    }}
                    size={13}
                  />
                </Tooltip.Trigger>
                <Tooltip.Content>Close file</Tooltip.Content>
              </Tooltip>
            )}
          </TabButton>
        ))}
      </ScrollableContainer>
    </Tabs>
  );
};
