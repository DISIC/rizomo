const COMMON_STYLES = {
  root: {
    width: '100%',
  },
  actions: {
    display: 'flex',
    justifyContent: 'center',
  },
  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9
  },
  video: {
    width: '100%',
  },
  paper: (isMobile, width = '25%') => ({
    overflow: 'auto',
    position: 'absolute',
    width: isMobile ? '95%' : width,
    maxHeight: '100%',
    top: isMobile ? 0 : '50%',
    left: isMobile ? '2.5%' : '50%',
    transform: isMobile ? 'translateY(50%)' : 'translate(-50%, -50%)',
  }),
  iconWrapper: {
    display: 'flex',
    justifyContent: 'center',
  },
  groupCountInfo: {
    marginTop: 30,
  },
  alert: {
    margin: 8,
  },
  buttonText: ({ member, candidate, type, theme }) => ({
    textTransform: 'none',
    backgroundColor:
      member || candidate ? null : type === 0 ? theme.palette.primary.main : theme.palette.secondary.main,
    color: member ? 'green' : candidate ? theme.palette.secondary.main : theme.palette.tertiary.main,
    fontWeight: 'bold',
    '&:hover': {
      color: member || candidate ? null : type === 0 ? theme.palette.primary.main : theme.palette.secondary.main,
      backgroundColor: member || candidate ? null : theme.palette.tertiary.main,
    },
  }),
};

export default COMMON_STYLES;
