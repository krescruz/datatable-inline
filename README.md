# Datatable-inline simple inline editing

Simple plugin datatable for https://datatables.net/

## Installation

In a browser:
```html
<script src="datatable-inline.js"></script>
```

## Usage and config
```js
var dataInline = window.DataTableInline;
var myDatatable = $('myTable').DataTable({ 'columns': getColumns() });

// Config Datatable inline
dataInline.setConfig({
    'datatable': myDatatable,
    'editCols': ['name', 'lastname']
});

// Define columns for your DataTable
function getColumns() {
    var columns = [
        { 'data': 'id' },
        { 'data': 'name', className: 'col-name' },
        { 'data': 'lastname', className: 'col-lastname' }
    ];
    // Important Add buttons actions
    columns.push(dataInline.getColumnAction());
    return columns;
}

// Define you actions
function onClickSave(event) {
    dataInline.preSaveAction(event).then(function(data) {
        console.log("Do something", data);
    });
}

function onClickDelete(event) {
    dataInline.preDeleteAction(event).then(function(data) {
        console.log("Do something", data);
    });
}

/**
 * Define events
 */
datatable.on('click', '.dt-inline-btn-edit', dataInline.editAction);
datatable.on('click', '.dt-inline-btn-save', onClickSave);
datatable.on('click', '.dt-inline-btn-delete', onClickDelete);

```
