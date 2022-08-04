import { ErrorTemplate } from '.';
import { render } from 'test-utils';

it('Should render <ErrorTemplate/>', () => {
  const { container } = render(
    <ErrorTemplate description="Error template description" title="Error template title" />
  );
  expect(container).toMatchSnapshot();
});
