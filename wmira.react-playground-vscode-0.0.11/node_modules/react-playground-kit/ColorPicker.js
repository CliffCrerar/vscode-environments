'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ColorPicker = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactColor = require('react-color');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var styles = {
    container: _defineProperty({
        padding: '5px',
        background: '#fff',
        borderRadius: '1px',
        boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
        display: 'inline-block',
        cursor: 'pointer'
    }, 'display', 'inline-block'),
    colorBox: {
        width: '36px',
        height: '14px',
        border: '1px solid #E5E5E5',
        borderRadius: '2px'
    },
    popup: {
        position: 'absolute',
        zIndex: '100'
    },
    cover: {
        position: 'fixed',
        top: '0px',
        right: '0px',
        bottom: '0px',
        left: '0px'
    }
};

var Color = function Color(props) {
    return _react2.default.createElement(
        'div',
        { style: styles.container, onClick: props.onClick },
        _react2.default.createElement('div', { style: _extends({}, styles.colorBox, { background: props.color }) }),
        props.showPicker === true ? _react2.default.createElement(
            'div',
            { style: styles.popup },
            _react2.default.createElement('div', { style: styles.cover, onClick: props.closePicker }),
            _react2.default.createElement(
                'div',
                { style: { position: 'absolute', right: 0 } },
                _react2.default.createElement(_reactColor.SketchPicker, { color: props.color, onChange: props.onColorChange })
            )
        ) : null
    );
};

var ColorPicker = exports.ColorPicker = function (_React$Component) {
    _inherits(ColorPicker, _React$Component);

    function ColorPicker(props) {
        _classCallCheck(this, ColorPicker);

        var _this = _possibleConstructorReturn(this, (ColorPicker.__proto__ || Object.getPrototypeOf(ColorPicker)).call(this, props));

        _this.onForegroundClicked = function () {
            _this.setState({ showForegroundPicker: true });
        };

        _this.onBackgroundClicked = function () {
            _this.setState({ showBackgroundPicker: true });
        };

        _this.closeBackgroundColorPicker = function () {
            setTimeout(function () {
                _this.setState({ showBackgroundPicker: false });
            });
        };

        _this.closeForegroundColorPicker = function () {
            setTimeout(function () {
                _this.setState({ showForegroundPicker: false });
            });
        };

        _this.state = { showForegroundPicker: false, showBackgroundPicker: false };
        return _this;
    }

    _createClass(ColorPicker, [{
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'div',
                null,
                _react2.default.createElement(Color, { color: this.props.background,
                    showPicker: this.state.showBackgroundPicker,
                    closePicker: this.closeBackgroundColorPicker,
                    onClick: this.onBackgroundClicked,
                    onColorChange: this.props.onBackgroundColorChange }),
                _react2.default.createElement('span', { style: { paddingRight: 4 } }),
                _react2.default.createElement(Color, { color: this.props.foreground,
                    showPicker: this.state.showForegroundPicker,
                    closePicker: this.closeForegroundColorPicker,
                    onClick: this.onForegroundClicked,
                    onColorChange: this.props.onForegroundColorChange })
            );
        }
    }]);

    return ColorPicker;
}(_react2.default.Component);

ColorPicker.propTypes = {
    foreground: _propTypes2.default.string,
    background: _propTypes2.default.string,
    onBackgroundColorChange: _propTypes2.default.func.isRequired
};
exports.default = ColorPicker;