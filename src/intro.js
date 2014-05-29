/*
 *  <%=pkg.name %>.js - <%=pkg.version %>
 *  Contributors: <%=pkg.contributors[0].name %>, <%=pkg.contributors[1].name %>
 *  Description: <%=pkg.description %>
 *  Source: <%=pkg.repository.url %>
 *  Champion may be freely distributed under the <%=pkg.license %> license
 */

!function($, undefined) {
  'use strict';

  var _global = this

  , champ = _global.champ = {}
  
  , DOMEvents = champ.DOMEvents = [
    'blur', 'focus', 'focusin', 'focusout', 'load', 'resize', 'scroll',
    'unload', 'click', 'dblclick', 'mousedown', 'mouseup', 'mousemove', 
    'mouseover', 'mouseout', 'mouseenter', 'mouseleave', 'change', 'select',
    'submit', 'keydown', 'keypress', 'keyup', 'error'
  ];

