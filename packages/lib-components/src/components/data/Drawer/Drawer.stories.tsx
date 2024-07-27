import React, { useMemo } from 'react';
import { useState } from 'react';
import { Meta, StoryFn } from '@storybook/react';

import { Button, TextField, CollapseList, Chip, RadioGroup, Switch, Drawer, DrawerSkeleton } from '../../../components';
import { styled } from '../../../styled';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[2]};
`;
const Status = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

export default {
  title: 'data/Drawer',
  component: Drawer,
} as Meta;

export const Loading: StoryFn = () => {
  return <DrawerSkeleton />;
};

interface FormFields {
  name: string;
  description: string;
  priceType: 'fixed' | 'variable';
  generateLicenseKeys: boolean;
  redirectAfterPurchase: boolean;
  onStoreFront: boolean;
}

export const Default: StoryFn = () => {
  const [open, setOpen] = useState<boolean>(false);

  const validationSchema = useMemo(
    () =>
      z.object({
        name: z.string().min(1, 'Name field is required'),
        description: z.string().min(20, 'description must be at least 20 characters'),
        priceType: z.enum(['fixed', 'variable']),
      }),
    [],
  );

  const { handleSubmit, control } = useForm<FormFields>({
    resolver: zodResolver(validationSchema),
  });

  const onSubmit: SubmitHandler<FormFields> = async () => {
    setOpen(false);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} text="Open drawer" />
      <Drawer open={open} onOpenChange={setOpen}>
        <Drawer.Content>
          <Drawer.Heading>Product Details</Drawer.Heading>
          <Drawer.Body>
            <Status>
              Status: <Chip label="active" color="success" variant="outline" />
            </Status>
            <form id="myform" onSubmit={handleSubmit(onSubmit)}>
              <CollapseList>
                <CollapseList.Item title="General">
                  <TextField
                    label="Name"
                    name="name"
                    required
                    control={control}
                    description={
                      'Give your product a short and clear name.\n50-60 characters is the recommended length for search engines.'
                    }
                  />
                  <TextField
                    label="Description"
                    name="description"
                    required
                    control={control}
                    description="Give your product a short and clear description. 120-160 characters is the recommended length for search engines"
                  />
                </CollapseList.Item>
                <CollapseList.Item title="Pricing">
                  <RadioGroup
                    control={control}
                    label="Selection a price type"
                    name="priceType"
                    options={[
                      {
                        label: 'Fixed',
                        labelPosition: 'left',
                        value: 'fixed',
                      },
                      {
                        label: 'Variable',
                        labelPosition: 'left',
                        value: 'variable',
                      },
                    ]}
                  />
                </CollapseList.Item>
              </CollapseList>
              <CollapseList.Item title="Settings">
                <Switch
                  control={control}
                  label="Generate License Keys"
                  name="generateLicenseKeys"
                  size="tiny"
                  description="Issue each sutomer a unique license key after purchase"
                />
                <Switch
                  control={control}
                  label="Redirect customers after purchase"
                  name="redirectAfterPurchase"
                  size="small"
                  description="Redirect customers to a custom URL after making a purchase"
                />
                <Switch
                  control={control}
                  label="Display product on storefront?"
                  name="onStoreFront"
                  description="Show this product on your storefront"
                  size="small"
                />
              </CollapseList.Item>
            </form>
          </Drawer.Body>
          <Drawer.Footer>
            <ButtonContainer>
              <Button text="Cancel" onClick={() => setOpen(false)} color="background" />
              <Button fullWidth text="Save changes" type="submit" form="myform" />
            </ButtonContainer>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>
    </>
  );
};
