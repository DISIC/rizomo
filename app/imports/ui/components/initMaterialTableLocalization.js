import i18n from 'meteor/universe:i18n';

export default function setMaterialTableLocalization(key) {
  return {
    toolbar: {
      searchPlaceholder: i18n.__(`${key}.materialTableLocalization.toolbar_searchPlaceholder`),
      searchTooltip: i18n.__(`${key}.materialTableLocalization.toolbar_searchPlaceholder`),
    },
    pagination: {
      labelRowsSelect: i18n.__(`${key}.materialTableLocalization.pagination_labelRowsSelect`),
      firstAriaLabel: i18n.__('materialTable.pagination_firstTooltip'),
      firstTooltip: i18n.__('materialTable.pagination_firstTooltip'),
      previousAriaLabel: i18n.__('materialTable.pagination_previousTooltip'),
      previousTooltip: i18n.__('materialTable.pagination_previousTooltip'),
      nextAriaLabel: i18n.__('materialTable.pagination_nextTooltip'),
      nextTooltip: i18n.__('materialTable.pagination_nextTooltip'),
      lastAriaLabel: i18n.__('materialTable.pagination_lastTooltip'),
      lastTooltip: i18n.__('materialTable.pagination_lastTooltip'),
    },
    body: {
      emptyDataSourceMessage: i18n.__(`${key}.materialTableLocalization.body_emptyDataSourceMessage`),
      addTooltip: i18n.__(`${key}.materialTableLocalization.body_addTooltip`),
      editTooltip: i18n.__(`${key}.materialTableLocalization.body_editTooltip`),
      deleteTooltip: i18n.__(`${key}.materialTableLocalization.body_deleteTooltip`),
      editRow: {
        deleteText: i18n.__(`${key}.materialTableLocalization.body_editRow_deleteText`),
        cancelTooltip: i18n.__('materialTable.body_editRow_cancelTooltip'),
        saveTooltip: i18n.__('materialTable.body_editRow_saveTooltip'),
      },
    },
  };
}
