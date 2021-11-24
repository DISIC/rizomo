import { createTheme } from '@material-ui/core/styles';

const THEMES = {
  laboite: {
    shape: {
      borderRadius: 8,
    },
    palette: {
      type: 'light',
      primary: {
        main: '#011CAA',
        light: '#ECEEF8',
        dark: '#212F74',
      },
      secondary: {
        main: '#E48231',
        light: '#FFDBA5',
      },
      tertiary: {
        main: '#fff',
      },
      backgroundFocus: {
        main: '#ffe0b2',
      },
      text: {
        primary: '#040D3E',
      },
      background: {
        default: '#F9F9FD',
      },
    },
    typography: {
      fontFamily: 'WorkSansRegular',
      h1: {
        fontFamily: 'WorkSansBold',
      },
      h2: {
        fontFamily: 'WorkSansBold',
      },
      h3: {
        fontFamily: 'WorkSansBold',
      },
      h4: {
        fontFamily: 'WorkSansBold',
      },
      h5: {
        fontFamily: 'WorkSansBold',
      },
      h6: {
        fontFamily: 'WorkSansBold',
      },
    },
  },
  rizomo: {
    shape: {
      borderRadius: 2,
    },
    palette: {
      type: 'light',
      primary: {
        main: '#000091',
        light: '#E5E5F4',
        dark: '#0909b9',
      },
      secondary: {
        main: '#c9191e',
        light: '#af161a',
        dark: '#9b1317',
      },
      tertiary: {
        main: '#fff',
      },
      backgroundFocus: {
        main: '#f5f5fe',
      },
      text: {
        primary: '#161616',
      },
      background: {
        default: '#f6f6f6',
        paper: '#fff',
      },
      info: {
        main: '#0063cb',
        light: '#0055af',
        dark: '#004b99',
      },
      success: {
        main: '#18753c',
        light: '#2aac5c',
        dark: '#249851',
      },
      warning: {
        main: '#b34000',
        light: '#983600',
        dark: '#842f00',
      },
      error: {
        main: '#ce0500',
        light: '#b20400',
        dark: '#9c0400',
      },
    },
    shadows: [
      'none',
      '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
      '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
      '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
      '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
      '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
      '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
      '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
      '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
      '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
      '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
      '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
      '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
      '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
      '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
      '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
      '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
      '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
      '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
      '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
      '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
      '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
      '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
      '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
      '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
      '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
      '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
      '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
    ],
    typography: {
      fontFamily: 'MarianneRegular',
      h1: {
        fontFamily: 'MarianneBold',
      },
      h2: {
        fontFamily: 'MarianneBold',
      },
      h3: {
        fontFamily: 'MarianneBold',
      },
      h4: {
        fontFamily: 'MarianneBold',
      },
      h5: {
        fontFamily: 'MarianneBold',
      },
      h6: {
        fontFamily: 'MarianneBold',
      },
    },
  },
};

const lightTheme = createTheme(THEMES[Meteor.settings.public.theme || 'laboite']);

export default lightTheme;
