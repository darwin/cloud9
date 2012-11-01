/**
 * In app documentation for the Cloud9 IDE
 *
 * @copyright 2010, Ajax.org B.V.
 * @license GPLv3 <http://www.gnu.org/licenses/gpl.txt>
 */
/*global inAppDocs, barDocsNav, barDocsContent, textCurrentDoc*/

define(function(require, exports, module) {

var ide = require("core/ide");
var ext = require("core/ext");
var dockpanel = require("ext/dockpanel/dockpanel");
var util = require("core/util");

var strDocs = require("text!ext/documentation/docs.js");

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
    css    : util.replaceStaticPrefix(css),
    nodes  : [],
    
    hasFwr : [],
    hasBwr : [], 
    currentPage : "home",
    
    hook : function(){
        var _self = this;        
        var name = "ext/documentation/documentation";
        
        dockpanel.addDockable({
            expanded    : 1,
            width       : 385,
            "min-width" : 385,
            barNum      : 2,
            sections : [
                {
                    width : 385,
                    "min-width" : 385,
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
    },

    init : function() {
        var _self = this;
        eval(strDocs);
        
        apf.importCssString(this.css);
    },
    
    userClickEvent: function(event){
        var clickTrigger = event.target;

        if (clickTrigger.className.indexOf("nav-section-header") > -1 || clickTrigger.parentNode.className.indexOf("nav-section-header") > -1){
            this.slideSubNavSection(clickTrigger);
            event.preventDefault();
        }
        else if (clickTrigger.className.indexOf("nav-submenu-item") > -1 || clickTrigger.parentNode.className.indexOf("nav-submenu-item") > -1){
            this.goToPage(this.getDocFileNameFromLink(clickTrigger), true);
            event.preventDefault();
        }
    },
    
    goHome: function(){        
        this.goToPage("home", true);
    },
    
    goBwr: function(){
        var page = this.hasBwr[this.hasBwr.length - 1];
        
        this.updateBwr();
        this.updateFwr(this.currentPage);
        this.goToPage(page);
    },
    
    goFwr: function(){
        var page = this.hasFwr[this.hasFwr.length - 1];
        
        this.updateFwr();
        this.updateBwr(this.currentPage);
        this.goToPage(page);
    },
    
    goToPage: function(pageName, fromLink){
        var docObj;
        
        if (pageName != "home") {
            docObj = this.getDocFromJSON(pageName);
            textCurrentDoc.setValue(this.cleanDocUrls(docObj.contents));
            
            barDocsNav.hide();
            barDocsContent.show();
        }
        else {
            barDocsNav.show();
            barDocsContent.hide();
        }
        
        if (fromLink) {
            this.updateFwr();
            this.updateBwr(this.currentPage);
        }
        
        this.currentPage = pageName;
        this.updateNavBtns();
    },
    
    getDocFileNameFromLink: function(docLinkEl){
        if (!docLinkEl)
            return "";
            
        if (!docLinkEl.href)
            docLinkEl = docLinkEl.firstChild;
            
        return docLinkEl.href.split("/").pop().split(".").shift();
    },
    
    getDocFromJSON: function(filename){  
        var files = this.docsData.files;
        for (var i = 0, l = files.length; i < l; i++) {
            if (files[i].filename == filename)
                return files[i];
        }
        
        return false;
    },
    
    updateBwr: function(page){
        if (page) {
            this.hasBwr.push(page);
        }
        else {
            this.hasBwr.pop();
        }
    },
    
    updateFwr: function(page){
        if (page) {
            this.hasFwr.push(page);
        }
        else {
            this.hasFwr.pop();
        }
    },
    
    updateNavBtns: function(){
        if (this.hasBwr.length)
            btnDocNavBwr.enable();
        else
            btnDocNavBwr.disable();
            
        if (this.hasFwr.length)
            btnDocNavFwr.enable();
        else
            btnDocNavFwr.disable();
            
        if (this.currentPage != "home")
            btnDocNavHome.enable();
        else
            btnDocNavHome.disable();
    },
    
    slideSubNavSection: function(navHeader){
        if (!navHeader || navHeader.id == "nav")
            return false;
            
        while(navHeader.tagName.toLowerCase() != "div") {
            navHeader = navHeader.parentNode;
        }
        
        var subSectionNode = navHeader.parentNode.getElementsByTagName("ul")[0];
        if (navHeader.className.indexOf("expanded") > -1) {
            subSectionNode.style.display = "none";
            apf.setStyleClass(navHeader, "", ["expanded"]);
        }
        else {
            subSectionNode.style.display = "block";
            apf.setStyleClass(navHeader, "expanded");
        }
        
        return false;
    },
    
    cleanDocUrls : function(str){
        if (!str)
            return str;
        
        return str.replace(/src="\.\//g, 'src="' + this.docsData.baseUrl + "/")
                  .replace(/src="[^http]/g, 'src="' + this.docsData.baseUrl + "/")
                  .replace(/href="\.\//g, 'href="' + this.docsData.baseUrl + "/");
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