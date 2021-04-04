import React, { Component } from "react";

class Button extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        const { className, title, id, onClick, dataPlacement } = this.props;
        return (
            <button
                id={id}
                type="button"
                data-toggle="tooltip"
                data-placement={dataPlacement ? dataPlacement : "bottom"}
                title={title}
                className={"btn btn-fa-icon" + (className ? " " + className : "")}
                onClick={onClick}
            >
                {this.props.children ? this.props.children : ""}
            </button>
        );
    }
}

export default Button;
