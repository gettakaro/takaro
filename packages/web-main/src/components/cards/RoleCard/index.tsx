import { FC } from 'react';
import { Card, Chip, Tooltip } from '@takaro/lib-components';
import { Header, TitleContainer } from './style';
import { RoleOutputDTO } from '@takaro/apiclient';
import { InnerBody } from '../style';
import { RoleActions } from '../../../components/roles/RoleActions';

export const RoleCard: FC<RoleOutputDTO> = ({ id, name, system }) => {
  return (
    <>
      <Card data-testid={`role-${name}`}>
        <Card.Body>
          <InnerBody>
            <Header>
              {system ? (
                <Tooltip placement="top">
                  <Tooltip.Trigger asChild>
                    <Chip label="system" color="backgroundAccent" />
                  </Tooltip.Trigger>
                  <Tooltip.Content>System roles are managed by Takaro and cannot be deleted.</Tooltip.Content>
                </Tooltip>
              ) : (
                <span />
              )}
              <RoleActions roleId={id} roleName={name} isSystem={system} />
            </Header>
            <TitleContainer>
              <h3>Role: {name}</h3>
            </TitleContainer>
          </InnerBody>
        </Card.Body>
      </Card>
    </>
  );
};
