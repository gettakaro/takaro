import { LinearGradient } from '@visx/gradient';
import { useTheme } from '../../hooks';

export const useGradients = (name: string) => {
  const theme = useTheme();

  // Constructing the gradient IDs
  const BACKGROUND_GRADIENT_ID = `background-gradient-${name}`;
  const AREA_GRADIENT_ID = `area-gradient-${name}`;

  // Gradient elements
  const backgroundGradient = (
    <LinearGradient id={BACKGROUND_GRADIENT_ID} from={theme.colors.backgroundAccent} to={theme.colors.backgroundAlt} />
  );

  const areaGradient = (
    <LinearGradient id={AREA_GRADIENT_ID} from={theme.colors.primary} to={theme.colors.primary} toOpacity={0.05} />
  );

  // Returning both gradient elements and their IDs
  return {
    background: {
      gradient: backgroundGradient,
      id: BACKGROUND_GRADIENT_ID,
    },
    chart: {
      gradient: areaGradient,
      id: AREA_GRADIENT_ID,
    },
  };
};
