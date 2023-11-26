import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { ErrorPage, ErrorPageProps } from '.';

export default {
  title: 'Views/PageNotFound',
  component: ErrorPage,
} as Meta;

export const PageNotFound: StoryFn<ErrorPageProps> = () => {
  return (
    <ErrorPage
      errorCode={404}
      title="Page not found"
      description="The page you are looking for does not exist."
      homeRoute="/"
    />
  );
};

export const NotAuthorized: StoryFn<ErrorPageProps> = () => {
  return (
    <ErrorPage
      errorCode={401}
      title="Not authorized"
      description="You are not authorized to view this page.
    Contact your administrator to request access."
      homeRoute="/"
    />
  );
};
