/**
 * In app documentation for the Cloud9 IDE
 *
 * @copyright 2010, Ajax.org B.V.
 * @license GPLv3 <http://www.gnu.org/licenses/gpl.txt>
 */
/*global inAppDocs*/

define(function(require, exports, module) {

var ide = require("core/ide");
var ext = require("core/ext");
var dockpanel = require("ext/dockpanel/dockpanel");
var util = require("core/util");

var skin = require("text!ext/documentation/skin.xml");
var markup = require("text!ext/documentation/documentation.xml");
var css = require("text!ext/documentation/documentation.css");

module.exports = ext.register("ext/documentation/documentation", {
    name    : "In app documentation",
    dev     : "Ajax.org",
    alone   : true,
    type    : ext.GENERAL,
    markup  : markup,
    skin            : {
        id : "documentation",
        data : skin,
        "media-path" : ide.staticPrefix + "/ext/documentation/images/"
    },
    css   : util.replaceStaticPrefix(css),
    nodes : [],

    hook : function(){
        var _self = this;        
        var name = "ext/documentation/documentation";
        
        dockpanel.addDockable({
            expanded : 1,
            width    : 300,
            barNum   : 2,
            sections : [
                {
                    width : 350,
                    height : 230,
                    flex : 2,
                    "class": "doc-panel-bg",
                    buttons : [
                        { caption: "Documentation", ext : [name, "inAppDocs"]}
                    ]
                }
            ]
        });
        
        dockpanel.register(name, "inAppDocs", {
            menu : "Documentation",
            primary : {
                backgroundImage: ide.staticPrefix + "/ext/main/style/images/debugicons.png",
                defaultState: { x: -8, y: -130 },
                activeState: { x: -8, y: -130 }
            }
        }, function(type) {
            ext.initExtension(_self);
            return inAppDocs;
        });
        
        ext.initExtension(_self);
    },

    init : function() {
        var _self = this;
        
        apf.importCssString(this.css);
    },
    
    slideSubSection: function(triggerNode){
        var subSectionNode = triggerNode.parentNode.parentNode.getElementsByTagName("ul")[0];
        if (triggerNode.parentNode["class"].indexOf("expanded") > -1) {
            subSectionNode.style.display = "none";
            apf.setStyleClass(triggerNode.parentNode, "", ["expanded"]);
        }
        else {
            subSectionNode.style.display = "block";
            apf.setStyleClass(triggerNode.parentNode, "expanded");
        } 
    },
    
    enable : function(){
        this.nodes.each(function(item){
            if (item && item.enable)
                item.enable();
        });
    },

    disable : function(){
        this.nodes.each(function(item){
            if (item && item.disable)
                item.disable();
        });
    },

    destroy : function(){
        this.nodes.each(function(item){
            if (item) {
                item.destroy(true, true);
                dockpanel.unregisterPage(item);
            }
        });
        
        this.nodes = [];
    }
});

});