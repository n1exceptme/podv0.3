Ext.Loader.setConfig({enabled: true});

Ext.require([
    'Ext.form.*',
    'Ext.data.*',
    'Ext.chart.*',
    'Ext.grid.Panel',
    'Ext.layout.container.Column',
	'Ext.ux.form.SearchField',
	'Ext.ux.LiveSearchGridPanel',
	'Ext.ux.GMapPanel',
	'Ext.ux.CheckColumn',
	'Ext.selection.CheckboxModel'
]);

Ext.onReady(function(){
    
	var MapImage = Ext.create('Ext.Img', {
    src: 'img/bologna.jpg'
	});
	
	
	//use a renderer for values in the data view.
    function perc(v) {
        return v + '%';
    }

    var bd = Ext.getBody(),
	form = false,
	rec = false,
	selectedStoreItem = false,
		
	//performs the highlight of an item in the bar series
	selectItem = function(storeItem) {
		var name = storeItem.get('company'),
			series = barChart.series.get(0),
			i, items, l;
		
		series.highlight = true;
		series.unHighlightItem();
		series.cleanHighlights();
		for (i = 0, items = series.items, l = items.length; i < l; i++) {
			if (name == items[i].storeItem.get('company')) {
				selectedStoreItem = items[i].storeItem;
				series.highlightItem(items[i]);
				break;
			}
		}
		series.highlight = false;
	},
	
	//updates a record modified via the form
	updateRecord = function(rec) {
		var name, series, i, l, items, json = [{
			'Name': 'Consumi (KWh)',
			'Data': rec.get('price')
		}, {
			'Name': 'Potenza Disp. %',
			'Data': rec.get('revenue %')
		}, {
			'Name': 'Growth %',
			'Data': rec.get('growth %')
		}, {
			'Name': 'Product %',
			'Data': rec.get('product %')
		}, {
			'Name': 'Market %',
			'Data': rec.get('market %')
		}];
		chs.loadData(json);
		selectItem(rec);
	},
	
	createListeners = function() {
		return {
			// buffer so we don't refire while the user is still typing
			buffer: 200,
			change: function(field, newValue, oldValue, listener) {
				if (rec && form) {
					if (newValue > field.maxValue) {
						field.setValue(field.maxValue);
					} else {
						form.updateRecord(rec);
						updateRecord(rec);
					}
				}
			}
		};
	};
        
    // sample static data for the store
    var myData = [
        ['Gennaio'],
        ['Febbraio'],
        ['Marzo'],
        ['Aprile'],
        ['Maggio'],
        ['Giugno'],
        ['Luglio'],
        ['Agosto'],
        ['Settembre'],
        ['Ottobre'],
        ['Novembre'],
        ['Dicembre']
    ];
    
    for (var i = 0, l = myData.length, rand = Math.random; i < l; i++) {
        var data = myData[i];
        data[1] = ((rand() * 10000) >> 0) / 100;
        data[2] = ((rand() * 10000) >> 0) / 100;
        data[3] = ((rand() * 10000) >> 0) / 100;
        data[4] = ((rand() * 10000) >> 0) / 100;
        data[5] = ((rand() * 10000) >> 0) / 100;
    }
	
	//create data store to be shared among the grid and bar series.
    var ds = Ext.create('Ext.data.ArrayStore', {
        fields: [
            {name: 'company'},
            {name: 'price',   type: 'float'},
			{name: 'indoor', type: 'bool'},
            {name: 'revenue %', type: 'float'},
            {name: 'growth %',  type: 'float'},
            {name: 'product %', type: 'float'},
            {name: 'market %',  type: 'float'}
        ],
        data: myData
    });
	
	//Definiamo lo store per l'Anagrafica
	var itemsPerPage = 30;
	
	var mapStore = Ext.create('Ext.data.Store', {
	fields: [
				'N',
    			'Conto_contrattuale',
    			'Impianto_vendita',
    			'Particella',
    			'Indirizzo_fornitura',
    			'Nr',
    			'Comune',
    			'Prov',
    			'Dist',
    			'Pod',
    			'Enel_Tel',
    			'Tipo_app',
    			'Potenza_disp',
    			'Tensione',
    			'Opzione_trasp',
    			'Consumi_KWh',
    			'Inizio_fornitura'    
		],
	autoLoad: false,
	pageSize: 50,
	storeId: 'mapStore',
		proxy:{ 
    		type: 'rest',
    		url: 'php/rest.php',
    		afterRequest:function( request, success )
    		{
    			console.log( 'request ' + request );
    			console.log( 'success '  + success );
    		}
    			
		},
        listeners: {
            write: function(mapStore, operation){
                var record = operation.getRecords()[0],
                    name = Ext.String.capitalize(operation.action),
                    verb;
                    
                    
                if (name == 'Destroy') {
                    record = operation.records[0];
                    verb = 'Destroyed';
                } else {
                    verb = name + 'd';
                }
                Ext.example.msg(name, Ext.String.format("{0} user: {1}", verb, record.getId()));
                
            }
        }

	});
	
	mapStore.load({
    params:{
        start:0,
        limit: itemsPerPage
    }
	});
	
	var conStore = Ext.create('Ext.data.Store', {
	fields: [
				'POD',
    			'consumi',
    			'mese',
    			'anno'
			],
	autoLoad: false,

	storeId: 'conStore',
		proxy:{ 
    		type: 'rest',
    		url: 'php/rest2.php',
    		afterRequest:function( request, success )
    		{
    			console.log( 'request2 ' + request );
    			console.log( 'success2 '  + success );
    		}
    			
		}
	});

    
    //create radar dataset model.
    var chs = Ext.create('Ext.data.JsonStore', {
        fields: ['Name', 'Data'],
        data: [
        {
            'Name': 'Consumi (KWh)',
            'Data': 100
        }, {
            'Name': 'Potenza Disp. %',
            'Data': 100
        }, {
            'Name': 'Growth %',
            'Data': 100
        }, {
            'Name': 'Product %',
            'Data': 100
        }, {
            'Name': 'Market %',
            'Data': 100
        }]
    });
    
    //Radar chart will render information for a selected company in the
    //list. Selection can also be done via clicking on the bars in the series.
    var radarChart = Ext.create('Ext.chart.Chart', {
        margin: '0 0 0 0',
        insetPadding: 20,
        flex: 1.2,
        animate: true,
        store: chs,
        theme: 'Blue',
        axes: [{
            steps: 5,
            type: 'Radial',
            position: 'radial',
            maximum: 100
        }],
        series: [{
            type: 'radar',
            xField: 'Name',
            yField: 'Data',
            showInLegend: false,
            showMarkers: true,
            markerConfig: {
                radius: 4,
                size: 4,
                fill: 'rgb(69,109,159)'
            },
            style: {
                fill: 'rgb(194,214,240)',
                opacity: 0.5,
                'stroke-width': 0.5
            }
        }]
    });
	
	
/*	var GPanel = Ext.create('Ext.ux.GMapPanel', {
			autoShow: true,
			layout: 'fit',
			title: 'Geolocalizzazione Fornitura su GoogleMaps',
			closeAction: 'hide',
			width:450,
			height:450,
			border: false,
			x: 500,
			y: 200,
			items: {
				xtype: 'gmappanel',
				center: {
					geoCodeAddr: '4 Yawkey Way, Boston, MA, 02215-3409, USA',
					marker: {title: 'Fenway Park'}
				},
				markers: [{
					lat: 42.339641,
					lng: -71.094224,
					title: 'Boston Museum of Fine Arts',
					listeners: {
						click: function(e){
							Ext.Msg.alert('It\'s fine', 'and it\'s art.');
						}
					}
				},{
					lat: 42.339419,
					lng: -71.09077,
					title: 'Northeastern University'
				}]
			}
		});	
	*/
	
	
	
	
	
    
    //create a grid that will list the dataset items.
    var gridPanel = Ext.create('Ext.grid.Panel', {

		id: 'company-form',
        flex: 0.60,
        store: ds,
        title:'Consumi',
	
		tbar: Ext.create('Ext.toolbar.Toolbar', {
			width   : 400,
			items: [
				{
				text:'Localizza POD', 
				//action:'create'
				handler: function(){
					var mapwin;
					if(mapwin) {
					mapwin.show();
					} else {
						mapwin = Ext.create('Ext.window.Window', {
							autoShow: true,
							layout: 'fit',
							title: 'Geolocalizzazione Fornitura su GoogleMaps',
							closeAction: 'hide',
							width:450,
							height:450,
							border: false,
							x: 500,
							y: 200,
							items: MapImage
						});
						
					}
				
				}}
			]
		}),
		
        columns: [
            {
                id       :'company',
                text   : 'POD',
                flex: 1,
                sortable : true,
                dataIndex: 'company'
            },
            {
                text   : 'Consumi (KWh)',
                width    : 100,
                sortable : true,
                dataIndex: 'price',
                align: 'right',
                //renderer : 'usMoney'
            },
            {
                text   : 'Potenza Disp.',
                width    : 75,
                sortable : true,
                align: 'right',
                dataIndex: 'revenue %',
                //renderer: perc
            }
/*			,
            {
                text   : 'Growth',
                width    : 75,
                sortable : true,
                align: 'right',
                dataIndex: 'growth %',
                //renderer: perc
            },
            {
                text   : 'Product',
                width    : 75,
                sortable : true,
                align: 'right',
                dataIndex: 'product %',
                //renderer: perc
            },
            {
                text   : 'Market',
                width    : 75,
                sortable : true,
                align: 'right',
                dataIndex: 'market %',
                //renderer: perc
            }*/
        ],

        listeners: {
            selectionchange: function(model, records) {
                var json, name, i, l, items, series, fields;
                if (records[0]) {
                    rec = records[0];
                    if (!form) {
                        form = this.up('form').getForm();
                        fields = form.getFields();
                        fields.each(function(field){
                            if (field.name != 'company') {
                                field.setDisabled(false);
                            }
                        });
                    } else {
                        fields = form.getFields();
                    }
                    
                    // prevent change events from firing
                    fields.each(function(field){
                        field.suspendEvents();
                    });
                    form.loadRecord(rec);
                    updateRecord(rec);
                    fields.each(function(field){
                        field.resumeEvents();
                    });
                }
            }
        }
    });


    //create a grid that will list the dataset items.
	var sm = Ext.create('Ext.selection.CheckboxModel');
	
	var selModel = Ext.create('Ext.selection.CheckboxModel', {
        listeners: {
            itemclick: function(sm, selections){
				var s = gridPanel2.getSelectionModel().getSelection();
				var data = gridPanel2.getSelectionModel().selected.items[0].data;
				// And then you can iterate over the selected items, e.g.: 
				selected = [];
				Ext.each(s, function (item) {
				  selected.push(item.data.someField);
				});
				
				Ext.Msg.alert('Hai selezionato il POD: ', data.Pod );
				//function(sm, selections) {
                //grid4.down('#removeButton').setDisabled(selections.length == 0);
            }
        }
    });
	
	//Griglia per l'Anagrafica
    var gridPanel2 = Ext.create('Ext.ux.LiveSearchGridPanel', {
        id: 'anagrafica',
        flex: 2,
        store: mapStore,
        title:'Anagrafica',
		selModel: selModel,
		
		plugins: [
			Ext.create('Ext.grid.plugin.RowEditing', {
				clicksToEdit: 2,
				autoCancel: false
			})
		],
		
		
/*		dockedItems: [{
            dock: 'top',
            xtype: 'toolbar',
            items: [{
                width: 400,
                fieldLabel: 'Search',
                labelWidth: 50,
                xtype: 'searchfield',
                store: mapStore
            }, '->', {
                xtype: 'component',
                itemId: 'POD',
                tpl: 'Matching threads: {count}',
                style: 'margin-right:5px'
            }]
        }],*/
		

		
		bbar: Ext.create('Ext.PagingToolbar', {
		            store: mapStore,
		            displayInfo: true,
		            displayMsg: 'Displaying topics {0} - {1} of {2}',
		            emptyMsg: "No topics to display"
		}),			
		
		
        columns: [

						Ext.create('Ext.grid.RowNumberer', {text:'#', width: 35}),
		                {text: 'Pod', dataIndex: 'Pod', editor: 'textfield', editor: 'textfield', flex:1, width:200},			
		           		{text: 'N.', dataIndex: 'N', editor: 'textfield', flex:1},
		                {text: 'Conto contrattuale', dataIndex: 'Conto_contrattuale', editor: 'textfield', flex:1},
		                {text: 'Impianto di vendita', dataIndex: 'Impianto_vendita', editor: 'textfield', flex:1},
		                
						{
						text: 'Particella', dataIndex: 'Particella', editor: 'textfield', flex:1
						}, 
						{
						text: 'Indirizzo di fornitura', dataIndex: 'Indirizzo_fornitura', editor: 'textfield', flex:1
						},
						{
						text: 'Comune', dataIndex: 'Comune', editor: 'textfield', flex:1
						},
						{
						text: 'Prov', dataIndex: 'Prov', editor: 'textfield', flex:1
						},
						
		                
		                
		                {text: 'Nr', dataIndex: 'Nr', editor: 'textfield', flex:1},

		                {text: 'Distributore', dataIndex: 'Dist', editor: 'textfield', flex:1},
		                {text: 'Codice Cliente', dataIndex: 'Enel_Tel', editor: 'textfield', flex:1},
		                {text: 'Tipo_app', dataIndex: 'Tipo_app', editor: 'textfield', flex:1},
		                {text: 'Potenza disponibile', dataIndex: 'Potenza_disp', editor: 'textfield', flex:1},
		                {text: 'Tensione', dataIndex: 'Tensione', editor: 'textfield', flex:1},
		                {text: 'Opzione di trasport', dataIndex: 'Opzione_trasp', editor: 'textfield', flex:1},
		                {text: 'Consumi (KWh)', dataIndex: 'Consumi_KWh', editor: 'textfield', flex:1},
		                {text: 'Inizio fornitura mercato libero', dataIndex: 'Inizio_fornitura', editor: 'textfield', flex:1}

		
/*			Ext.create('Ext.grid.RowNumberer'),
            {
                id       :'company',
                text   : 'Company',
                flex: 1,
                sortable : true,
                dataIndex: 'id'
            },
            {
                text   : 'Consumi (KWh)',
                width    : 75,
                sortable : true,
                dataIndex: 'name',
                align: 'right',
                //renderer : 'usMoney'
            },
            {
                text   : 'Potenza Disp.',
                width    : 75,
                sortable : true,
                align: 'right',
                dataIndex: 'address',
                //renderer: perc
            },
            {
                text   : 'Growth',
                width    : 75,
                sortable : true,
                align: 'right',
                dataIndex: 'state',
                //renderer: perc
            }*/
        ],
		
		listeners: {
			itemclick : function() {
				var podNum = gridPanel2.getSelectionModel().selected.items[0].data;
				
				conStore.clearFilter();
				conStore.filter('POD', podNum.Pod);
				conStore.load();
			}		
		}
		
/*        listeners: {
            selectionchange: function(model, records) {
                var json, name, i, l, items, series, fields;
                if (records[0]) {
                    rec = records[0];
                    if (!form) {
                        form = this.up('form').getForm();
                        fields = form.getFields();
                        fields.each(function(field){
                            if (field.name != 'company') {
                                field.setDisabled(false);
                            }
                        });
                    } else {
                        fields = form.getFields();
                    }
                    
                    // prevent change events from firing
                    fields.each(function(field){
                        field.suspendEvents();
                    });
                    form.loadRecord(rec);
                    updateRecord(rec);
                    fields.each(function(field){
                        field.resumeEvents();
                    });
                }
            }
        }*/
    });

	//Griglia per i Consumi
    var gridPanel2b = Ext.create('Ext.grid.Panel', {

		id: 'gP2b',
        flex: 0.60,
        store: conStore,
        title:'Consumi POD',
	
        columns: [
			Ext.create('Ext.grid.RowNumberer', {text : '#', width : 35} ),
            {
                id       :'PODc',
                text   : 'POD',
				width: 150,
                flex: 1,
                sortable : true,
                dataIndex: 'POD'
            },
            {
                text   : 'Consumi (KWh)',
                width    : 100,
                sortable : true,
                dataIndex: 'consumi',
                align: 'right',
                //renderer : 'usMoney'
            },
            {
                text   : 'Mese',
                width    : 75,
                sortable : true,
                align: 'right',
                dataIndex: 'mese',
                //renderer: perc
            },
            {
                text   : 'Anno',
                width    : 75,
                sortable : true,
                align: 'right',
                dataIndex: 'anno',
                //renderer: perc
            }
        ]
    });


	
	
	
	
	
	
    //create a bar series to be at the top of the panel.
    var barChart = Ext.create('Ext.chart.Chart', {
        flex: 1,
		title: 'Consumi Mensili Commessa (KWh * 100)',
        shadow: true,
        animate: true,
        store: ds,
        axes: [{
            type: 'Numeric',
			title: 'KWh * 1000',
            position: 'left',
            fields: ['price'],
            minimum: 0,
            hidden: true
        }, {
            type: 'Category',
			title: 'Consumi Mensili Commessa (KWh * 100)',
            position: 'bottom',
            fields: ['company'],
            label: {
                renderer: function(v) {
                    return Ext.String.ellipsis(v, 15, false);
                },
                font: '9px Arial',
                rotate: {
                    degrees: 270
                }
            }
        }],
        series: [{
            type: 'column',
            axis: 'left',
            highlight: true,
            style: {
                fill: '#456d9f'
            },
            highlightCfg: {
                fill: '#a2b5ca'
            },
            label: {
                contrast: true,
                display: 'insideEnd',
                field: 'price',
                color: '#000',
                orientation: 'vertical',
                'text-anchor': 'middle'
            },
            listeners: {
                'itemmouseup': function(item) {
                     var series = barChart.series.get(0),
                         index = Ext.Array.indexOf(series.items, item),
                         selectionModel = gridPanel.getSelectionModel();
                     
                     selectedStoreItem = item.storeItem;
                     selectionModel.select(index);
                }
            },
            xField: 'name',
            yField: ['price']
        }]        
    });
    

	var barPanel = Ext.create('Ext.panel.Panel',{
		title: 'Andamento annuale consumi',
		tbar: [{
            text: 'Save Chart',
            handler: function() {
                Ext.MessageBox.confirm('Confirm Download', 'Would you like to download the chart as an image?', function(choice){
                    if(choice == 'yes'){
                        barChart.save({
                            type: 'image/png'
                        });
                    }
                });
            }
        }],
		items: barChart
	});
	
    //disable highlighting by default.
    barChart.series.get(0).highlight = false;
    
    //add listener to (re)select bar item after sorting or refreshing the dataset.
    barChart.addListener('beforerefresh', (function() {
        var timer = false;
        return function() {
            clearTimeout(timer);
            if (selectedStoreItem) {
                timer = setTimeout(function() {
                    selectItem(selectedStoreItem);
                }, 900);
            }
        };
    })());
	
    var lineChart = Ext.create('Ext.chart.Chart', {
            xtype: 'chart',
            style: 'background:#fff',
            animate: true,
            store: store1,
            shadow: true,
            theme: 'Category1',
            legend: {
                position: 'right'
            },
            axes: [{
                type: 'Numeric',
                minimum: 0,
                position: 'left',
                fields: ['pod1', 'pod2', 'pod3'],
                title: 'Consumi (KWh)',
                minorTickSteps: 1,
                grid: {
                    odd: {
                        opacity: 1,
                        fill: '#ddd',
                        stroke: '#bbb',
                        'stroke-width': 0.5
                    }
                }
            }, {
                type: 'Category',
                position: 'bottom',
                fields: ['name'],
                title: 'Periodo di Fatturazione 2011'
            }],
            series: [{
                type: 'line',
                highlight: {
                    size: 7,
                    radius: 7
                },
                axis: 'left',
                xField: 'name',
                yField: 'pod1',
				smooth: true,
                markerConfig: {
                    type: 'cross',
                    size: 4,
                    radius: 4,
                    'stroke-width': 0
                }
            }, {
                type: 'line',
                highlight: {
                    size: 7,
                    radius: 7
                },
                axis: 'left',
                smooth: true,
                xField: 'name',
                yField: 'pod2',
                markerConfig: {
                    type: 'circle',
                    size: 4,
                    radius: 4,
                    'stroke-width': 0
                }
            }, {
                type: 'line',
                highlight: {
                    size: 7,
                    radius: 7
                },
                axis: 'left',
                smooth: true,
                fill: false,
                xField: 'name',
                yField: 'pod3',
                markerConfig: {
                    type: 'circle',
                    size: 4,
                    radius: 4,
                    'stroke-width': 0
                }
            }]
        });
	
	
	
    
    /*
     * Here is where we create the Form
     */
    var gridForm = Ext.create('Ext.form.Panel', {
        title: 'Dettaglio Consumi e Anagrafica',

        frame: true,
        bodyPadding: 5,
        width: 870,
        height: 920,

        fieldDefaults: {
            labelAlign: 'left',
            msgTarget: 'side'
        },
    
        layout: {
            type: 'vbox',
            align: 'stretch'
        },
        
        items: [
			gridPanel2,
			

	    	{
	        xtype: 'splitter'   // A splitter between the two child items
	    	},
			gridPanel2b,

	    	{
	        xtype: 'splitter'   // A splitter between the two child items
	    	},
			
			{
                height: 200,
                layout: 'fit',
                margin: '0 0 3 0',
                items: [lineChart]
            },
			{
                height: 200,
                layout: 'fit',
                margin: '0 0 3 0',
                items: [barChart]
            }
  /*          {
            
            layout: {type: 'hbox', align: 'stretch'},
            flex: 3,
            border: false,
            bodyStyle: 'background-color: transparent',
            
            items: [
				
				gridPanel
				
				, 
				{
                flex: 0.4,
                layout: {
                    type: 'vbox',
                    align:'stretch'
					},
                margin: '0 0 0 5',
                title: 'Scheda Fornitura',
                items: [{
                    margin: '5',
                    xtype: 'fieldset',
                    flex: 1,
                    title:'Dettaglio Consumi',
                    defaults: {
                        width: 240,
                        labelWidth: 90,
                        disabled: true
                    },
                    defaultType: 'textfield',
                    items: [{
                        fieldLabel: 'POD',
                        name: 'company',
                        xtype: 'textfield'
                    },{
                        fieldLabel: 'Consumi (KWh)',
                        name: 'price',
                        maxValue: 100,
                        minValue: 0,
                        enforceMaxLength: true,
                        maxLength: 5,
                        listeners: createListeners('price')
                    },{
                        fieldLabel: 'Potenza Disp',
                        name: 'revenue %',
                        maxValue: 100,
                        minValue: 0,
                        enforceMaxLength: true,
                        maxLength: 5,
                        listeners: createListeners('revenue %')
                    },{
                        fieldLabel: 'Growth %',
                        name: 'growth %',
                        maxValue: 100,
                        minValue: 0,
                        enforceMaxLength: true,
                        maxLength: 5,
                        listeners: createListeners('growth %')
                    },{
                        fieldLabel: 'Product %',
                        name: 'product %',
                        maxValue: 100,
                        minValue: 0,
                        enforceMaxLength: true,
                        maxLength: 5,
                        listeners: createListeners('product %')
                    },{
                        fieldLabel: 'Market %',
                        name: 'market %',
                        maxValue: 100,
                        minValue: 0,
                        enforceMaxLength: true,
                        maxLength: 5,
                        listeners: createListeners('market %')
                    },{
						xtype: 'textfield',
						name: 'textfield1',
						fieldLabel: 'Ragione Sociale',
						value: 'CITELUM SA SEDE SECONDARIA'
					},{
						xtype: 'textfield',
						name: 'textfield2',
						fieldLabel: 'Codice Fiscale',
						value: '4501140968'
					},{
						xtype: 'textfield',
						name: 'textfield3',
						fieldLabel: 'Partita IVA',
						value: 'IT04501140968'
					}]
					} 
					
				]
            }]
        }
	*/	],
        renderTo: bd
    });

    var gp = Ext.getCmp('company-form');
});