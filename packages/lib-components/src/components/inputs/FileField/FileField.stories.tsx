import React, { useState } from 'react';
import { Alert, FileField, FileFieldProps } from '../../../components';
import { styled } from '../../../styled';
import { Meta, StoryFn } from '@storybook/react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 50%;
  margin: 0 auto;
  align-items: center;
  justify-content: center;
`;

export default {
  title: 'Inputs/FileField',
  component: FileField,
  decorators: [(story) => <Wrapper>{story()}</Wrapper>],
  args: {
    label: 'Profile Image',
    loading: false,
    description: 'This is a description',
  },
} as Meta<FileFieldProps>;

export const OnSubmit: StoryFn<FileFieldProps> = (args) => {
  type FormFields = {
    profileImage: FileList;
  };

  const MAX_FILE_SIZE = 500000; // 5MB
  const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const [value, setValue] = useState<string | null>(null);

  const validationSchema = z.object({
    profileImage: z
      .any()
      .refine((files) => files?.length == 1, 'Image is required.')
      .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, 'Max file size is 5MB.')
      .refine(
        (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
        'Only .jpg, .jpeg, .png and .webp files are accepted.',
      ),
  });

  const { control, handleSubmit } = useForm<FormFields>({
    resolver: zodResolver(validationSchema),
  });
  const onSubmit: SubmitHandler<FormFields> = ({ profileImage }) => {
    setValue(profileImage[0].name);
  };

  return (
    <>
      <Alert variant="warning">
        Although the upload could be limited to a single file, the returned type will always be a FileList.
      </Alert>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FileField
          name="profileImage"
          hint={args.hint}
          label={args.label}
          loading={args.loading}
          description={args.description}
          disabled={args.disabled}
          required={args.required}
          readOnly={args.readOnly}
          placeholder={args.placeholder}
          multiple={false}
          control={control}
        />
        <button type="submit">Submit</button>
      </form>
      <p>uploaded filename: {value}</p>
    </>
  );
};

export const MultipleImages: StoryFn<FileFieldProps> = (args) => {
  type FormFields = {
    profileImages: FileList;
  };

  const MAX_FILE_SIZE = 500000; // 5MB
  const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const MAX_FILES = 2;
  const [fileNames, setFileNames] = useState<string[] | null>(null);

  const validationSchema = z.object({
    profileImages: z
      .any()
      .refine(
        (obj) => {
          // Check if obj is a FileList
          return obj instanceof FileList;
        },
        {
          message: 'You must select at least one file.',
        },
      )
      .refine(
        (fileList: FileList) => {
          // Check the number of files
          return fileList.length > 0 && fileList.length <= MAX_FILES;
        },
        {
          message: `You must select between 1 and ${MAX_FILES} files.`,
        },
      )
      .refine(
        (fileList: FileList) => {
          // Check each file's size
          return Array.from(fileList).every((file) => file.size <= MAX_FILE_SIZE);
        },
        {
          message: 'Each file must be no larger than 5MB.',
        },
      )
      .refine(
        (fileList: FileList) => {
          // Check each file's type
          return Array.from(fileList).every((file) => ACCEPTED_IMAGE_TYPES.includes(file.type));
        },
        {
          message: 'Only .jpg, .jpeg, .png, and .webp files are accepted.',
        },
      ),
  });

  const { control, handleSubmit } = useForm<FormFields>({
    resolver: zodResolver(validationSchema),
  });
  const onSubmit: SubmitHandler<FormFields> = ({ profileImages }) => {
    setFileNames(Array.from(profileImages).map((file) => file.name));
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FileField
          name="profileImages"
          hint={args.hint}
          label="Profile images"
          loading={args.loading}
          description={args.description}
          disabled={args.disabled}
          required={args.required}
          readOnly={args.readOnly}
          placeholder={args.placeholder}
          multiple={true}
          control={control}
        />
        <button type="submit">Submit</button>
      </form>
      <p>uploaded filenames: {fileNames}</p>
    </>
  );
};

export const JsonValidationExample: StoryFn<FileFieldProps> = (args) => {
  type FormFields = {
    configFile: FileList;
  };

  const MAX_FILE_SIZE = 500000; // 5MB
  const ACCEPTED_IMAGE_TYPES = ['application/json'];
  const [file, setFile] = useState<File | null>(null);

  const validationSchema = z.object({
    configFile: z
      .any()
      // Unfortunately we cannot try and parse the file since refine does not allow async functions
      .refine((files) => files?.length == 1, 'File is required.')
      .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, 'Max file size is 5MB.')
      .refine((files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type), 'Only json files are accepted.'),
  });

  const { control, handleSubmit } = useForm<FormFields>({
    resolver: zodResolver(validationSchema),
  });
  const onSubmit: SubmitHandler<FormFields> = ({ configFile }) => {
    setFile(configFile[0]);
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FileField
          name="configFile"
          hint={args.hint}
          label="Config file"
          loading={args.loading}
          description={args.description}
          disabled={args.disabled}
          required={args.required}
          readOnly={args.readOnly}
          placeholder={args.placeholder}
          multiple={false}
          control={control}
        />
        <button type="submit">Submit</button>
      </form>
      {file && <p>uploaded filename: {file.name}</p>}
    </>
  );
};
