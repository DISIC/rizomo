export const MOBILE_SIZE = 768;

const reducer = (state, action) => {
  const { type, data = {} } = action;
  const { language, width } = data;
  switch (type) {
    case 'language':
      return {
        ...state,
        language,
      };
    case 'mobile':
      return {
        ...state,
        isMobile: width < MOBILE_SIZE,
      };
    case 'user':
      return {
        ...state,
        ...data,
      };
    default:
      throw new Error();
  }
};

export default reducer;
