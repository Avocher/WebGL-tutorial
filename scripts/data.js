"use strict";

define( function() {

    return {
        load: function( name, require, onload, config ) {
            var xhr = new XMLHttpRequest();

            xhr.open( 'GET', name, true );
            xhr.responseType = 'arraybuffer';

            xhr.onload = function( evt ) {
                onload( this.response );
            };

            xhr.send();
        }
    };
} );
