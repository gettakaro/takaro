import { Font, Head as EHead, HeadProps } from '@react-email/components';
import { FC } from 'react';

export const Head: FC<HeadProps> = ({ children, ...rest }) => {
  return (
    <EHead {...rest}>
      <Font
        fontFamily="Roboto"
        fallbackFontFamily="Verdana"
        webFont={{
          url: 'https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2',
          format: 'woff2',
        }}
        fontWeight={400}
        fontStyle="normal"
      />
      {children}
    </EHead>
  );
};
