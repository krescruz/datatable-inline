/**
 * Simple datatable plugin for edit row data inline
 * https://github.com/krescruz/datatable-inline.git
 *
 * Released under MIT license
 * https://github.com/krescruz/datatable-inline/blob/master/LICENSE
 * 
 * Library js base
 * https://datatables.net
 */

(function() {

    var setup = function DataTableInline() {

        var editModel = {};
        var config = {};

        return {
            'setConfig': setConfig,
            'editAction': editAction,
            'preSaveAction': preSaveAction,
            'preDeleteAction': preDeleteAction,
            'getColumnAction': getColumnAction,
            'getModelCurrent': getModelCurrent,
        };

        function setConfig(conf) {
            config.dataTable = conf.datatable || undefined;
            config.editCols = conf.editCols || [];
            registerEvent();
        }

        function registerEvent() {
            config.dataTable.on('click', '.dt-inline-btn-cancel', onClickCancel);
        }

        function onClickCancel() {
            resetUiMode();
            resetUiDataRow();
        }

        function preDeleteAction(e) {
            var domRow = getDomRow($(e.target));
            return getDataInRow(domRow);
        }

        function getModelCurrent() {
            return editModel;
        }

        function setModelCurrent(data) {
            editModel = _.clone(data);
        }

        function getDataTable() {
            return config.dataTable;
        }

        function getDataDatatable() {
            return config.dataTable.rows().data();
        }

        /**
         * Helpers para DataTable
         * Devuelve un elemento tr a partir de elemento
         * @param {dom} element - Dom elemento jquery de row datable
         */
        function getDomRow(element) {
            return element.parents('tr')[0];
        }

        /**
         * Helpers para DataTable
         * Devuelve el objeto data de un row
         * @param {dom} dt - Dom elemento jquery de datatable
         * @param {dom} element - Dom elemento row valido para datable
         * @return {object} Objeto de un row
         */
        function getDataRow(dt, element) {
            return dt.row(element).data();
        }


        function getDataInRow(rowdom) {
            data = {};
            data.rowdom = rowdom;
            data.data = getDataDatatable();
            data.rowdata = getDataRow(config.dataTable, data.rowdom);
            data.rowindex = _.findIndex(data.data, data.rowdata);
            return setPromise(data);
        }

        /**
         *
         * Devuelve un celda dom, apartir de un datatable, nombre de columna y numero row
         * @param {Objects} datatable - Objeto DataTable
         * @param {string} column_name - Nombre de columna
         * @param {number} nRow - Número de fila
         */
        function getNodeColumn(dataTable, columnName, nRow) {
            return dataTable.row().cell('.col-' + columnName + ':eq(' + nRow + ')').node();
        }

        function setInitModeEdit(e) {
            var domRow = getDomRow($(e));
            setModeEdit(domRow);
            return setPromise(domRow);
        }

        function setModeEdit(rowDom) {
            $(".dt-inline-btn-save").hide();
            $(".dt-inline-btn-cancel").hide();
            $(".dt-inline-btn-edit").prop('disabled', true);
            $(".dt-inline-btn-delete").prop('disabled', true);

            $(rowDom).find('.dt-inline-btn-save').show();
            $(rowDom).find('.dt-inline-btn-cancel').show();
        }

        function resetUiMode(rowDom) {
            $(".dt-inline-btn-save").prop('disabled', false).hide();
            $(".dt-inline-btn-cancel").prop('disabled', false).hide();

            $(".dt-inline-btn-edit").prop('disabled', false);
            $(".dt-inline-btn-delete").prop('disabled', false);
            $(".dt-inline-btn-edit").show();
        }

        /**
         * Helpers para DataTable
         * Retorna columnas default para el datatable
         */
        function getColumnAction() {
            /*jshint multistr: true */
            var domButtons = '<button type="button" class="btn btn-default pull-right dt-inline-btn-edit" \
                                        aria-label="Left Align"> \
                                    <span class="glyphicon glyphicon-pencil" aria-hidden="true"></span> \
                                </button>';
            domButtons += '<button type="button" class="btn btn-default pull-right dt-inline-btn-delete" \
                                    aria-label="Left Align"> \
                                <span class="glyphicon glyphicon-trash" aria-hidden="true"></span> \
                              </button>';
            domButtons += '<button type="button" class="btn btn-default pull-right dt-inline-btn-save" \
                                    aria-label="Left Align" style="display: none;"> \
                                <span class="glyphicon glyphicon-ok" aria-hidden="true"></span> \
                              </button>';
            domButtons += '<button type="button" class="btn btn-default pull-right dt-inline-btn-cancel" \
                                    aria-label="Left Align" style="display: none;"> \
                                <span class="glyphicon glyphicon-remove" aria-hidden="true"></span> \
                              </button>';

            return {
                'data': null,
                'orderable': false,
                'defaultContent': domButtons
            };
        }

        function resetUiDataRow() {
            var data = getModelCurrent();
            var domCell = null;
            var columnName = '';
            for (var i = 0; i < config.editCols.length; i++) {
                columnName = config.editCols[i];
                domCell = getNodeColumn(config.dataTable, columnName, data.rowindex);
                $(domCell).html(data.rowdata[columnName]);
            }
        }

        function dtSetFormEdit(data) {

            var domCell;
            var columnName = '';
            for (var i = 0; i < config.editCols.length; i++) {
                columnName = config.editCols[i];
                domCell = getNodeColumn(config.dataTable, columnName, data.rowindex);
                $(domCell).html($('<input type="text"/>').val(data.rowdata[columnName]));
            }
            // Almacena datos de la edición actual
            setModelCurrent(data);
            return setPromise(data);
        }


        /**
         * ACCIONES DEL ROW
         */
        function editAction(e) {
            return setInitModeEdit(e.target)
                .then(getDataInRow)
                .then(dtSetFormEdit);
        }

        function preSaveAction(event) {
            // FALTA OPTIMIZAR Todo esto
            var data = {
                'rowDom': getDomRow($(event.target)),
                'dataDatatable': getDataDatatable()
            };
            data.prevData = _.clone(getDataRow(data.dataDatatable, data.rowDom));
            data.newData = _.clone(getDataRow(data.dataDatatable, data.rowDom));
            data.rowindex = _.findIndex(data.dataDatatable, data.newData);

            var domCell = null;
            var columnName = '';
            for (var i = 0; i < config.editCols.length; i++) {
                columnName = config.editCols[i];
                domCell = getNodeColumn(config.dataTable, columnName, data.rowindex);
                data.newData[columnName] = $(domCell).find('input[type=text]').val();
                $(domCell).html(data.newData[columnName]);
            }
            config.dataTable.row(data.rowDom).data(data.newData).draw();
            config.dataTable.draw();

            resetUiMode();
            return setPromise({ 'newData': data.newData, 'prevData': data.prevData });
        }

        function setPromise(data) {
            var deferred = $.Deferred();
            deferred.resolve(data);
            return deferred.promise();
        }
    };

    window.DataTableInline = new setup();

})(window);
