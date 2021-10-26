import React from 'react';
import { ActionZone } from '../utils/styles';
import AutoPublish from './AutoPublish';
import Impersonate from './Impersonate';
import MethodsHandlers from './MethodsHandlers';

const ToolsContainer = ({ handleClose }) => (
  <ActionZone onContextMenu={handleClose}>
    <AutoPublish />
    <Impersonate />
    <MethodsHandlers />
  </ActionZone>
);

export default ToolsContainer;
