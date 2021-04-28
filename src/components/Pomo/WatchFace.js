import React, { Component } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import IconButton from "./../IconButton.js";

import {
    faPlayCircle,
    faPauseCircle,
    faUndo,
    faStepForward,
    //faForward,
} from "@fortawesome/free-solid-svg-icons";

class WatchFace extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    format(t) {
        //(t)imer

        let formatT = {
            h: t.h < 10 ? "0" + t.h : t.h,
            m: t.m < 10 ? "0" + t.m : t.m,
            s: t.s < 10 ? "0" + t.s : t.s,
        };

        return formatT.h + ":" + formatT.m + ":" + formatT.s;
    }

    render() {
        const { start, pause, resetPhase, nextPhase } = this.props;
        const { started, paused, timer, chosenTimer, phase } = this.props;

        let upcomingPhase = chosenTimer.timers[(phase + 1) % chosenTimer.timers.length];

        const isEnd = timer.h === 0 && timer.m === 0 && timer.s === 0;
        const isTimerRun = JSON.stringify(timer) !== JSON.stringify(chosenTimer.timers[phase]);

        return (
            <div id="watch">
                <div className="d-flex justify-content-between forehead easy-eyes">
                    <div className="d-flex align-items-center">
                        <span className="title">{chosenTimer.timers[phase].title}</span>
                        <IconButton
                            id="restart"
                            className={"undo ml-1" + (isTimerRun ? "" : " d-none")}
                            title={"Starta om fas"}
                            onClick={(e) => {
                                e.preventDefault();
                                resetPhase();
                            }}
                        >
                            <FontAwesomeIcon icon={faUndo} />
                        </IconButton>
                        <IconButton id="phase" title={"Nästa fas: " + upcomingPhase.title} onClick={nextPhase}>
                            <FontAwesomeIcon icon={faStepForward} />
                        </IconButton>
                    </div>
                    <div className="dontduckinglookatme">
                        {this.props.children ? this.props.children : ""}

                        {/*
Toolbelt-isch

                      <div
                        className="d-inline-block"
                        data-toggle="tooltip"
                        data-placement="bottom"
                        title="Information"
                               >
                        <div
                            data-toggle="collapse"
                            data-target="#information"
                            aria-expanded="false"
                            aria-controls="information"
                            className={"btn btn-fa-icon" + (information ? " active" : "")}
                            onClick={this.information}
                        >
                          <FontAwesomeIcon icon={faInfoCircle} />
                        </div>
                      </div>
                      */}
                    </div>
                </div>
                <div className="d-flex d-flex justify-content-between face easy-eyes">
                    <span className="align-middle">{this.format(timer)}</span>
                    <div className="d-flex align-items-center">
                        <IconButton
                            id="play"
                            className={
                                "play d-flex justify-content-center align-items-center " +
                                (isEnd && started ? " pulse" : "")
                            }
                            onClick={started && isEnd ? nextPhase : paused ? start : pause}
                        >
                            <FontAwesomeIcon icon={(started && isEnd) || paused ? faPlayCircle : faPauseCircle} />
                        </IconButton>
                    </div>
                </div>
            </div>
        );
    }
}

export default WatchFace;
