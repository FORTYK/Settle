import React, { Component } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlayCircle,
    faPauseCircle,
    //faCog,
    //faInfoCircle,
    faUndo,
    faArrowRight,
    //faForward,
} from "@fortawesome/free-solid-svg-icons";

//import Extrapolate from "../components/Extrapolate.js";

class Pomo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            settings: false,

            started: false,
            paused: true,
            courtesy: true,
            courtesyTimer: 1200,

            phase: 0,

            timer: {
                h: 0,
                m: 0,
                s: 0,
            },
            startTime: new Date(),
            endTime: new Date(),

            timers: [
                {
                    title: "Studera",
                    h: 0,
                    m: 45,
                    s: 0,
                },
                {
                    title: "Paus",
                    h: 0,
                    m: 15,
                    s: 0,
                },
            ],
        };

        //this.settings = this.settings.bind(this);

        this.resetPhase = this.resetPhase.bind(this);
        this.nextPhase = this.nextPhase.bind(this);

        this.start = this.start.bind(this);
        this.pause = this.pause.bind(this);

        this.updateTime = this.updateTime.bind(this);

        this.tick = this.tick.bind(this);
    }

    componentDidMount() {
        // Temp
        const { timers, phase } = this.state;
        window.$('[data-toggle="tooltip"]').tooltip();

        this.setState(
            {
                timer: timers[phase],
            },
            () => {
                setInterval(this.tick, 100);
            }
        );
    }

    tick() {
        let self = this;
        const { endTime, started, paused, timer, courtesy, courtesyTimer } = this.state;

        if (courtesy) {
            setTimeout(() => {
                if (self.state.courtesy) {
                    self.setState({
                        courtesy: false,
                    });

                    this.updateTime(timer);
                }
            }, courtesyTimer);
        } else {
            if (started && !paused) {
                var currentTime = new Date();

                // (d)elta
                let dt = endTime - currentTime;
                let dtDate = new Date(dt);
                dtDate.setMinutes(dtDate.getMinutes() + dtDate.getTimezoneOffset());

                if (dt < 0) {
                    this.setState({
                        timer: {
                            h: 0,
                            m: 0,
                            s: 0,
                        },
                    });

                    window.$("#play").attr("data-original-title", "Nästa fas");
                } else {
                    this.setState({
                        timer: {
                            h: dtDate.getHours(),
                            m: dtDate.getMinutes(),
                            s: dtDate.getSeconds(),
                        },
                    });
                }
            }
        }
    }

    format(t) {
        //(t)imer

        let formatT = {
            h: t.h < 10 ? "0" + t.h : t.h,
            m: t.m < 10 ? "0" + t.m : t.m,
            s: t.s < 10 ? "0" + t.s : t.s,
        };

        //console.log("timeString :>> ", timeString);
        return formatT.h + ":" + formatT.m + ":" + formatT.s;
    }

    start(e) {
        e.preventDefault();
        const { timer } = this.state;

        this.updateTime(timer);

        this.setState({
            started: true,
            courtesy: true,

            paused: false,
        });
    }

    pause(e) {
        e.preventDefault();
        const { timer } = this.state;

        this.updateTime(timer);

        this.setState({
            paused: true,
            courtesy: true,
        });
    }

    resetPhase(e) {
        e.preventDefault();
        const { timers, phase } = this.state;
        let timer = timers[phase];

        this.updateTime(timer);

        this.setState({
            paused: true,
            courtesy: true,

            timer: timer,
        });
    }

    nextPhase(e) {
        e.preventDefault();

        const { timer, timers, paused } = this.state;

        let { phase } = this.state;
        const isStart = JSON.stringify(timer) !== JSON.stringify(timers[phase]);
        const isEnd = timer.h === 0 && timer.m === 0 && timer.s === 0;

        // isSkip is true if user changes phase while having ran
        let isSkip = isStart && !isEnd;

        // Next phase in iteration
        phase = (phase + 1) % timers.length;

        this.setState(
            {
                paused: isSkip ? true : paused,
                courtesy: true,

                phase: phase,
                timer: timers[phase],
            },
            () => {
                this.updateTime(timers[phase]);

                let nextPhase = timers[(phase + 1) % timers.length];
                window.$("#phase").attr("data-original-title", "Nästa fas: " + nextPhase.title);
                window.$("#play").attr("data-original-title", "");

                window.$('[data-toggle="tooltip"]').tooltip();
            }
        );
    }

    updateTime(timer) {
        var currentTime = new Date();
        var endTime = currentTime;

        endTime.setHours(currentTime.getHours() + timer.h);
        endTime.setMinutes(currentTime.getMinutes() + timer.m);
        endTime.setSeconds(currentTime.getSeconds() + timer.s);

        this.setState({
            startTime: currentTime,
            endTime: endTime,
        });
    }

    /*
    settings(e) {
        e.preventDefault();
        const { settings } = this.state;

        this.setState({
            settings: !settings,
        });
    }
    */

    render() {
        const { /*settings, */ started, paused, timer, timers, phase } = this.state;
        let nextPhase = timers[(phase + 1) % timers.length];
        const isEnd = timer.h === 0 && timer.m === 0 && timer.s === 0;

        let isTimerRun = JSON.stringify(timer) !== JSON.stringify(timers[phase]);

        return (
            <div>
                <div className="th d-flex align-items-center">
                    <div className="container">
                        <div className="row d-flex justify-content-center">
                            <div className="col-auto">
                                <div id="watch">
                                    <div className="d-flex justify-content-between forehead easy-eyes">
                                        <div className="d-flex align-items-center">
                                            <span className="title">{timers[phase].title}</span>
                                            <button
                                                className={"btn btn-fa-icon undo ml-1" + (isTimerRun ? "" : " d-none")}
                                                onClick={this.resetPhase}
                                                data-toggle="tooltip"
                                                data-placement="right"
                                                title={"Nollställ timer"}
                                            >
                                                <FontAwesomeIcon icon={faUndo} />
                                            </button>
                                            {/*this.format(timers[phase])*/}
                                        </div>
                                        <div className="dontduckinglookatme">
                                            {/* 
                                            <a className="btn btn-fa-icon mr-1">
                                                <FontAwesomeIcon icon={faInfoCircle} />
                                            </a>
                                            */}
                                            <button
                                                id="phase"
                                                className="btn btn-fa-icon"
                                                onClick={this.nextPhase}
                                                data-toggle="tooltip"
                                                data-placement="bottom"
                                                title={"Nästa fas: " + nextPhase.title}
                                            >
                                                <FontAwesomeIcon icon={faArrowRight} />
                                            </button>
                                            {/*<a
                                                href="#settings"
                                                className={"btn btn-fa-icon" + (settings ? " active" : "")}
                                            >
                                                onClick={this.settings}
                                                <FontAwesomeIcon icon={faCog} />
                                            </a>*/}
                                        </div>
                                    </div>
                                    <div className="d-flex d-flex justify-content-between face easy-eyes">
                                        <span className="align-middle">{this.format(timer)}</span>
                                        <div className="d-flex align-items-center">
                                            <button
                                                id="play"
                                                data-toggle="tooltip"
                                                data-placement="bottom"
                                                title=""
                                                className={"btn btn-fa-icon play" + (isEnd && started ? " pulse" : "")}
                                                onClick={
                                                    started && isEnd ? this.nextPhase : paused ? this.start : this.pause
                                                }
                                            >
                                                <FontAwesomeIcon
                                                    icon={(started && isEnd) || paused ? faPlayCircle : faPauseCircle}
                                                />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/*
                
                <div className="th d-flex align-items-center">
                    <div className="container">
                        <div className="row">
                            <div className="col-12 col-lg-8">
                                <h1 id="settings">
                                    Inställningar
                                    <Extrapolate
                                        info={
                                            "Projektet är WIP och därför sparas inte inställningarna när hemsidan laddas om"
                                        }
                                    />
                                </h1>
                                <p> </p>
                                <div></div>
                                {/*
                                <textarea className="temp"></textarea>
                                
                            </div>
                        </div>
                        
                    </div>
                </div>
                */}
                {/*
                    <div className="row d-flex justify-content-center">
                        <div className="col-8">
                            <div className="row">
                                <div className="col-12 ">
                                    <div className="row">
                                        <div className="col d-flex">
                                            <div>Arbete</div>
                                            <div className="easy-eyes">asdasd</div>
                                        </div>
                                        <div className="col-auto d-flex">
                                            <h1>00:45:00</h1>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    */}
            </div>
        );
    }
}

export default Pomo;
