import { createMuiTheme } from '@material-ui/core';

const darkTheme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      main: '#011CAA',
      light: '#ECEEF8',
      dark: '#212F74',
    },
    secondary: {
      main: '#EFAC61',
      light: '#FFDBA5',
    },
  },
});

export default darkTheme;
