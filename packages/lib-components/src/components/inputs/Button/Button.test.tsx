import { Button } from '.';
import { render } from 'test-utils';

it('Should render <Button/>', () => {
  const { container } = render(
    <Button
      onClick={() => {
        /* */
      }}
      text="button text"
    />
  );
  expect(container).toMatchSnapshot();
});
