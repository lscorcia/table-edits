
;(function ($, window, document, undefined) {
    var pluginName = "tableedits",
        defaults = {
            keyboard: true,
            dblclick: true,
            button: true,
            cancelButton: true,
            deleteButton: true,
            buttonSelector: ".edit",
            cancelSelector: ".cancel",
            deleteSelector: ".delete",
            maintainWidth: true,
            dropdowns: {},
            edit: function() {},
            save: function() {},
            cancel: function() {},
            delete: function() { $(this).remove(); }
        };

    function tableedits(element, options) {
        this.element = element;
        this.options = $.extend({}, defaults, options) ;

        this._defaults = defaults;
        this._name = pluginName;

        this.init();
    }

    tableedits.prototype = {
        init: function() {
            this.editing = false;

            if (this.options.dblclick) {
                $(this.element)
                    .css('cursor', 'pointer')
                    .bind('dblclick', this.toggle.bind(this));
            }

            if (this.options.button) {
                $(this.options.buttonSelector, this.element)
                    .bind('click', this.toggle.bind(this));
            }

            if (this.options.cancelButton) {
                $(this.options.cancelSelector, this.element)
                    .bind('click', this.cancel.bind(this));
            }

            if (this.options.deleteButton) {
                $(this.options.deleteSelector, this.element)
                    .bind('click', this.delete.bind(this));
            }
        },

        toggle: function(e) {
            e.preventDefault();

            this.editing = !this.editing;

            if (this.editing) {
                this.edit();
            } else {
                this.save();
            }
        },

        edit: function() {
            var instance = this,
                values = {};

            $('td[data-field]', this.element).each(function() {
                var input,
                    field = $(this).data('field'),
                    value = $(this).text(),
                    width = $(this).width();

                values[field] = value;

                $(this).empty();

                if (instance.options.maintainWidth) {
                    $(this).width(width);
                }

                if (field in instance.options.dropdowns) {
                    input = $('<select></select>');

                    for (var i = 0; i < instance.options.dropdowns[field].length; i++) {
                        $('<option></option>')
                             .text(instance.options.dropdowns[field][i])
                             .appendTo(input);
                    };

                    input.val(value)
                         .data('old-value', value)
                         .dblclick(instance._captureEvent);
                } else {
                    input = $('<input type="text" />')
                        .val(value)
                        .data('old-value', value)
                        .dblclick(instance._captureEvent);
                }

                input.appendTo(this);

                if (instance.options.keyboard) {
                    input.keydown(instance._captureKey.bind(instance));
                }
            });

            this.options.edit.bind(this.element)(values);
        },

        save: function() {
            this.editing = false;
            var instance = this,
                values = {};

            $('td[data-field]', this.element).each(function() {
                var value = $(':input', this).val();

                values[$(this).data('field')] = value;

                $(this).empty()
                       .text(value);
            });

            this.options.save.bind(this.element)(values);
        },

        cancel: function() {
            this.editing = false;
            var instance = this,
                values = {};

            $('td[data-field]', this.element).each(function() {
                var value = $(':input', this).data('old-value');

                values[$(this).data('field')] = value;

                $(this).empty()
                       .text(value);
            });

            this.options.cancel.bind(this.element)(values);
        },

        delete: function() {
            if (this.editing)
                this.cancel();

            this.options.delete.bind(this.element)();
        },

        _captureEvent: function(e) {
            e.stopPropagation();
        },

        _captureKey: function(e) {
            if (e.which === 13) {
                this.save();
            } else if (e.which === 27) {
                this.cancel();
            }
        }
    };

    $.fn[pluginName] = function(options) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName,
                new tableedits(this, options));
            }
        });
    };

})(jQuery, window, document);
