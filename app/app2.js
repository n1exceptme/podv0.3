Ext.Loader.setConfig({enabled:true});

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

Ext.application({
    name: 'MyApp',
    launch: function() {




        var position = new google.maps.LatLng(37.44885,-122.158592);
        infowindow = new google.maps.InfoWindow({
                content: 'Sencha Touch HQ'
            });
            
        var mapdemo = new Ext.Map({
            mapOptions : {
                center : new google.maps.LatLng(37.381592, -122.135672),  //nearby San Fran
                zoom : 12,
                mapTypeId : google.maps.MapTypeId.ROADMAP,
                navigationControl: true,
                navigationControlOptions: {
                        style: google.maps.NavigationControlStyle.DEFAULT
                    }
            },




            listeners : {
                maprender : function(comp, map){
                    var marker = new google.maps.Marker({
                                     position: position,
                                     title : 'Sencha HQ',
                                     map: map
                                });




                                google.maps.event.addListener(marker, 'click', function() {
                                     infowindow.open(map, marker);
                                });
                    setTimeout( function(){ map.panTo (position); } , 1000);
                }
            }
        });
                   
        tabpanel = Ext.create("Ext.tab.Panel", {
            xtype:'tabpanel',
            id: 'tabpanel',            
            fullscreen: true,
            tabBarPosition: 'bottom',
            items: [
                {
                    title: 'Home',
                    iconCls: 'MyHome',
                    scroll: 'vertical',
                    html: [ "My HTML 1"    ], 
                    dockedItems: [{
                        xtype: "toolbar",
                        docked: 'top',
                        items: [ 
                            {
                                xtype: "spacer", 
                            },
                            {
                                xtype: "button", 
                                text: "Refresh", 
                                handler: function () { 
                                    // function
                                }                                
                            }
                        ]
                    }]                            
                },               
                {
                    xtype: 'list',
                    title: 'Snapshot',
                    iconCls: 'Snapshot',
                    itemTpl: "<b>{title}:</b> {desc}",
                    store: {
                        fields: ['title', 'desc'],
                        data: [
                            {title: 'Name', desc: "Sencha Name"},
                            {title: 'Email', desc: "Sencha Email"},
                            {title: 'Mobile 1', desc: "Sencha Mobile 1"},
                            {title: 'Mobile 2', desc: "Sencha Mobile 2"}
                        ]
                    }
                },
                {
                    title: 'History',
                    iconCls: 'History',
                    html: [ "My HTML 2" ].join("")
                },  
                {
                    id: 'ViolationsTab',
                    title: 'Violations',
                    iconCls: 'Violations',
                    scroll: 'vertical',
                    badgeText: "5",
                    html: [ "<div id='TblContainerV'>My HTML 3</div>" ], 
                    dockedItems: [{
                        xtype: "toolbar",
                        docked: 'top',
                        items: [ 
                            {
                                xtype: "spacer", 
                            },
                            {
                                xtype: "button", 
                                text: "Refresh", 
                                handler: function () { 
                                    //Ext.Msg.alert('Alert', 'Violations Refresh', Ext.emptyFn);
                                }                                
                            }
                        ]
                    }]                            
                },                
                {
                    title: 'Map',
                    iconCls: 'Map',
                    layout: 'fit',
                    
                    items: [mapdemo],
                    dockedItems: [{
                        xtype: "toolbar",
                        docked: 'top',
                        items: [ 
                            {
                                xtype: "spacer", 
                            },
                            {
                                xtype: "button", 
                                text: "Refresh", 
                                handler: function () { 
                                    //Ext.Msg.alert('Alert', 'Violations Refresh', Ext.emptyFn);
                                    //initialize();
                                }                                
                            }
                        ]
                    }]
                }                                                
            ]
        }).setActiveItem(0);     
    }
    
    
});