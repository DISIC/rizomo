import styled from 'styled-components';

const TEXT_COLOR = 'rgba(255, 255, 255, 0.6)';
const BACKGROUND_COLOR = 'rgba(43,63,83,.92)';
const BACKGROUND_COLOR_HOVER = 'rgba(63,63,63,.92)';
const BACKGROUND_COLOR_COLLECTION = 'rgba(43,63,83,.92)';

export const CollectionListerWrapper = styled.div`
  font-family: Liberation Mono, Courier, Lucidatypewriter, Fixed, monospace !important;
  z-index: 10000;
  position: fixed;
  bottom: 0px;
  background-color: ${BACKGROUND_COLOR};
  left: 0px;
  min-width: 350px;
  max-width: 350px;
  border-top: 1px solid grey;
  border-right: 1px solid grey;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  max-height: 100%;
  user-select: none;
  border-top-right-radius: 5px;
`;

export const ActionZone = styled.div`
  z-index: 100000;
  position: fixed;
  ${({ bottom }) => (bottom ? 'bottom' : 'top')}: 15px;
  left: 15px;
  display: flex;
  justify-content: space-around;
  user-select: none;
`;

export const IconWrapper = styled.div`
  height: 70px;
  width: 70px;
  background-color: ${BACKGROUND_COLOR};
  border-radius: 50%;
  cursor: pointer;
  transition: all 300ms ease-in-out;
  z-index: 100000;
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
  margin: 5px;
  svg {
    fill: lightgrey;
    stroke: lightgrey;
    height: 60%;
    width: 60%;
    &:hover {
      fill: salmon;
      stroke: salmon;
    }
  }
`;

export const ListerHeader = styled.div`
  font-size: 14px;
  font-weight: bold;
  color: ${TEXT_COLOR};
  padding: 8px;
  border-bottom: 1px solid grey;
  background-color: rgba(100, 100, 100, 0.9);
  display: flex;
  justify-content: space-between;
  user-select: none;
  span {
    cursor: pointer;
  }
`;
export const CollectionHeader = styled.div`
  font-size: 14px;
  font-weight: bold;
  color: ${TEXT_COLOR};
  padding: 8px;
  border-top: 1px solid grey;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  user-select: none;
  background-color: ${({ selected }) => (selected ? 'black' : BACKGROUND_COLOR_COLLECTION)};
  &:hover {
    background-color: ${({ selected }) => (selected ? 'black' : BACKGROUND_COLOR_COLLECTION)};
  }
`;

export const DocumentWrapper = styled.div`
  background-color: black;
  padding: 4px;
  padding-top: ${({ tools }) => (tools ? 8 : 0)}px;
  padding-bottom: 8px;
  overflow: auto;
  ::-webkit-scrollbar {
    display: none !important;
    user-select: none;
  }
  .content {
    border-radius: 8px;
    background-color: ${BACKGROUND_COLOR_COLLECTION};
    padding: 4px;
    padding-top: 0px;
    overflow: hidden;
    font-size: 14px;
    user-select: none;
    pre {
      color: grey;
    }
    .object-key {
      color: salmon !important;
    }
  }
`;

export const MenuContainer = styled.div`
  display: flex;
  justify-content: space-between;
  user-select: none;
  div {
    padding: 4px;
    color: grey;
    text-align: center;
    display: flex;
    width: 25%;
    justify-content: center;
    border-right: 1px solid grey;
    user-select: none;
    cursor: pointer;
    &:last-child {
      border-right: none;
    }
    &:hover {
      background-color: ${BACKGROUND_COLOR_HOVER};
      svg {
        fill: salmon;
      }
    }
    svg {
      height: 25px;
      fill: grey;
    }
  }
`;

export const LedSignal = styled.div`
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background-color: ${({ light }) => (light ? 'green' : 'red')};
`;

export const BigToolContainer = styled.div`
  font-family: Liberation Mono, Courier, Lucidatypewriter, Fixed, monospace !important;
  z-index: 100000;
  background-color: ${BACKGROUND_COLOR_COLLECTION};
  min-width: 350px;
  max-width: 350px;
  border-top: 1px solid grey;
  border-right: 1px solid grey;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  max-height: 100%;
  user-select: none;
  border-radius: 5px;
  margin: 5px;
  input {
    margin: 3px;
  }
  ul {
    margin: 0px;
    padding: 8px;
    max-height: 500px;
    overflow-y: auto;
    overflow-x: hidden;
    ::-webkit-scrollbar {
      display: none !important;
      user-select: none;
    }
    li {
      color: white;
      padding: 2px;
      border-bottom: 1px solid gray;
      display: flex;
      justify-content: space-between;
      cursor: pointer;
      &:hover {
        background-color: ${BACKGROUND_COLOR_HOVER};
      }
      span {
        color: grey;
      }
    }
    li:last-child {
      border-bottom: none;
    }
    li.selected {
      background-color: ${BACKGROUND_COLOR_HOVER};
    }
  }
`;

export const ImpersonateUserData = styled.div`
  color: white;
  padding: 2px;
  display: flex;
  flex-direction: column;
  span {
    color: grey;
  }
`;
export const MethodData = styled.div`
  color: white;
  padding: 2px;
  display: flex;
  flex-direction: column;
  width: 100%;
  span {
    color: grey;
  }
  .react-json-view {
    width: 100%;
    margin-top: 5px;
    margin-bottom: 5px;
    pre {
      color: grey;
    }
    .object-key {
      color: salmon !important;
    }
  }
`;
